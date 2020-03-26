// requires autobahn

// Base class for all wwise objects
class WwiseObject extends GenericModel
{
    constructor(basicInfo, waapiJS, debug = false)
    {
        super();
        this.waapiJS = waapiJS;
        this.init(basicInfo);
        if(debug) this.debugCreation();
    }

    debugCreation()
    {
        let id = this.guid == undefined ? "{pending ID}" : this.guid;
        let name = this.name == undefined ? "no name" : this.name;
        console.log("Building " + this.type + " object " + id + " - " + name + " (as " + this.constructor.name + ")");
    }

    init(basicInfo)
    {
        for(let property in basicInfo)
            this[property] = basicInfo[property];

        this.guid = basicInfo.id // renaming id to guid
//        this.parent = undefined; now in fetchParents method, obsolete ?
    }

    reset()
    {
        var query = {from:{id:[this.guid]}};
        let wwiseObject = this;
        return this.waapiJS.queryObjects(query).then(function(res) {
            // TODO: manage query failure
            wwiseObject.init(res.kwargs.return[0]);
            return wwiseObject.fetchWwiseData().then(function() {
                wwiseObject.refreshViews();
            });
        });
    }

    fetchData()
    {
        return new Promise(function(resolve, reject) { resolve(); });
    }

    fetchParents(recursive = false)
    {
        var self = this;
        return this.waapiJS.queryFamily(this.guid, "parent").then(function(res) {
            if( res.kwargs.return.length > 0 ) {
                return self.processNewParentObject(res.kwargs.return[0]).then(function() {
                    if(recursive)
                        return self.parent.fetchParents(recursive);
                    else
                        return new Promise(function(resolve, reject) { resolve(); });
                });
            }
        });
    }

    // override if reference object needs a particular initialization
    processNewParentObject(parentObject)
    {
        this.parent = this.makeParentObject(parentObject);
        return new Promise(function(resolve, reject) { resolve(); });
    }

    // to be overriden by classes that need a specific class of parent object
    makeParentObject(wwiseObject)
    {
        return new WwiseObject(wwiseObject, this.waapiJS);
    }

    fetchChildren(recursive = false)
    {
        this.childrenToFetch = [];
        this.childrenObjects = [];
        let filter = recursive ? "descendants" : "children";
        let wwiseObject = this;
        return this.waapiJS.queryFamily(this.guid, filter).then(function(res) {
            wwiseObject.childrenToFetch = res.kwargs.return;
            return wwiseObject.fetchNextChildObject();
        });
    }

    fetchNextChildObject()
    {
        if( this.childrenToFetch.length < 1 ) return;
        let nextChild = this.childrenToFetch.shift();
        let newWwiseObject = this.makeChildObject(nextChild);
        this.childrenObjects.push(newWwiseObject);
        return this.fetchNextChildObject();
    }

    // to be overriden by classes that need a specific class of child objects
    makeChildObject(wwiseObject)
    {
        return new WwiseObject(wwiseObject, this.waapiJS);
    }

    fetchReferences()
    {
        this.referencesToFetch = [];
        this.referenceObjects = [];
        let self = this;
        return this.waapiJS.queryFamily(this.guid, "referencesTo").then(function(res) {
            self.referencesToFetch = res.kwargs.return;
            return self.fetchNextReferenceObject();
        });
    }

    fetchNextReferenceObject()
    {
        if( this.referencesToFetch.length < 1 ) return;
        let self = this;
        return this.processNewReferenceObject(this.referencesToFetch.shift()).then(function() {
            return self.fetchNextReferenceObject();
        });
    }

    // override if reference object needs a particular initialization
    processNewReferenceObject(refObject)
    {
        let newWwiseObject = this.makeReferenceObject(refObject);
        this.referenceObjects.push({
            "source" : newWwiseObject, // the reference (soundbank, event, etc)
            "target" : this // the referenced object (because it can be aggregated at a child/parent object level)
        });
        return new Promise(function(resolve, reject) { resolve(); });
    }

    // to be overriden by classes that need a specific class of reference objects
    makeReferenceObject(wwiseObject)
    {
        return new WwiseObject(wwiseObject, this.waapiJS, false);
    }

    getObjLink(fullPath = false)
    {
        var link = $("<a />");
        link.text(fullPath ? this.path : this.name);
        link.attr("href", "wwise://" + this.path);
        link.addClass("wwiseObjLink");
        return link.get(0).outerHTML;
    }

    commit()
    {
        if( this.guid ) {
            console.log("wwise object " + this.name + " already exists with guid " + this.guid);
            return new Promise(function(resolve, reject) {
                resolve();
            });
        }

        console.log( "creating wwise object " + this.name );
        let query = {
            parent: this.parent.guid,
            type: this.type,
            name: this.name
        }

        var wwiseObject = this;
        return this.waapiJS.query(ak.wwise.core.object.create, query).then(function(res) {
            wwiseObject.guid = res.kwargs.id;
        });
    }

    commitName()
    {
        if( !this.guid ) {
            console.log("No wwise object " + this.name + " exist yet, can't set name");
            return new Promise(function(resolve, reject) { reject(); });
        }

        let query = {
            object: this.guid,
            value: this.name
        }

        var wwiseObject = this;
        return this.waapiJS.query(ak.wwise.core.object.setName, query);
    }

    commitProperty(propertyName)
    {
        if( !this.guid ) {
            console.log("No wwise object " + this.name + " exists yet, can't set property " + propertyName);
            return new Promise(function(resolve, reject) { reject(); });
        }

        if( !this[propertyName] ) {
            console.log("No property " + propertyName + " exists on wwise object " + this.name);
            return new Promise(function(resolve, reject) { resolve(); });
        }

        let query = {
            object: this.guid,
            property: propertyName,
            value: this[propertyName]
        }

        var wwiseObject = this;
        return this.waapiJS.query(ak.wwise.core.object.setProperty, query);
    }

    commitNotes()
    {
        if( !this.guid ) {
            console.log("No wwise object " + this.name + " exists yet, can't set notes");
            return new Promise(function(resolve, reject) { reject(); });
        }

        if( !this["notes"] ) {
            console.log("No notes exist on wwise object " + this.name);
            return new Promise(function(resolve, reject) { resolve(); });
        }

        let query = {
            object: this.guid,
            value: this["notes"]
        }

        var wwiseObject = this;
        return this.waapiJS.query(ak.wwise.core.object.setNotes, query);
    }

    searchAndReplaceInName(find, repl)
    {
        if(!this.hasOwnProperty('oldName'))
            this.oldName = this.name;

        if(find == "")
            this.name = this.oldName;
        else
            this.name = this.oldName.replace(find, repl);
        this.refreshViews();
    }
}

// Base class for all wwise objects in the actor-mixer hierarchy
class WwiseActorMixerObject extends WwiseObject
{
    constructor(basicInfo, waapiJS, debug = false)
    {
        super(basicInfo, waapiJS, debug);
    }

    init(basicInfo)
    {
        super.init(basicInfo);
        this.childrenToCommit = [];
    }
}

class WwiseBlendContainer extends WwiseActorMixerObject
{
    constructor(basicInfo, waapiJS, debug = false)
    {
        super(basicInfo, waapiJS, debug);
    }
}

class WwiseEvent extends WwiseObject
{
    constructor(basicInfo, waapiJS, debug = false)
    {
        super(basicInfo, waapiJS, debug);

        //this.childrenToFetch = [];
        //this.actions = [];
    }

/*  Child actions not currently used
    fetchWwiseData()
    {
        var wwiseEvent = this;
        return super.fetchWwiseData().then(function() {
            return wwiseEvent.getChildren().then(function(res) {
                wwiseEvent.childrenToFetch = res.kwargs.return;
                return wwiseEvent.fetchNextChildAction();
            });
        });
    }

    fetchNextChildAction()
    {
        if( this.childrenToFetch.length < 1 ) return;
        let nextChild = this.childrenToFetch.shift();
        let wwiseEvent = this;
        if( nextChild.type == "Action") {
            let newAction = new WwiseAction(nextChild, this.waapiJS);
            this.actions.push(newAction);
            return newAction.fetchWwiseData().then(function() {
                return wwiseEvent.fetchNextChildAction();
            })
        }
        // TODO: CHECK IF NECESSARY
        return wwiseEvent.fetchNextChildAction();
    }
*/
}

class WwiseAction extends WwiseObject
{
    constructor(basicInfo, waapiJS, debug = false)
    {
        super(basicInfo, waapiJS, debug);
    }

    fetchWwiseData()
    {
        var wwiseAction = this;
        return super.fetchWwiseData().then(function() {
            var query = {
                from:{id:[wwiseAction.guid]}
            };
            var options = {
                return: ['@Target']
            }
            return wwiseAction.waapiJS.queryObjects(query, options).then(function(res) {
                console.log("fetchWwiseActionData", res);
                wwiseAction.TargetReference = res.kwargs.return[0]["@Target"];
                return wwiseAction.fetchTarget();
            });
        });
    }

    fetchTarget()
    {
        let wwiseAction = this;
        let query = {
            from:{id:[this.TargetReference.id]}
        };
        return this.waapiJS.queryObjects(query).then(function(res) {
            console.log("action target", res);
            if( res.kwargs.return.length > 0 ) {
                if( res.kwargs.return[0].type == "Sound" )
                    wwiseAction.target = new WwiseSound(res.kwargs.return[0], wwiseAction.waapiJS);
                else
                    wwiseAction.target = new WwiseObject(res.kwargs.return[0], wwiseAction.waapiJS);
                return wwiseAction.target.fetchWwiseData();
            }
        });
    }
}

class WwiseSound extends WwiseObject
{
    constructor(basicInfo, waapiJS, debug = false)
    {
        super(basicInfo, waapiJS, debug);

        this.childrenToFetch = [];
        this.sources = [];
    }

    fetchWwiseData()
    {
        var wwiseSound = this;
        return super.fetchWwiseData().then(function() {
            return wwiseSound.getChildren().then(function(res) {
                wwiseSound.childrenToFetch = res.kwargs.return;
                return wwiseSound.fetchNextChildAudioSource();
            });
        });
    }

    fetchNextChildAudioSource()
    {
        if( this.childrenToFetch.length < 1 ) return;
        let nextChild = this.childrenToFetch.shift();
        let wwiseSound = this;
        if( nextChild.type == "AudioFileSource") {
            let newAudioFileSource = new WwiseAudioFileSource(nextChild, this.waapiJS);
            this.sources.push(newAudioFileSource);
            return newAudioFileSource.fetchWwiseData().then(function() {
                return wwiseSound.fetchNextChildAudioSource();
            })
        }
        // TODO: CHECK IF NECESSARY
        return wwiseSound.fetchNextChildAudioSource();
    }
}

class WwiseAudioFileSource extends WwiseObject
{
    constructor(basicInfo, waapiJS, debug = false)
    {
        super(basicInfo, waapiJS, debug);
    }

    fetchWwiseData()
    {
        var wwiseAudioFileSource = this;
        return super.fetchWwiseData().then(function() {
            var query = {
                object: wwiseAudioFileSource.guid,
                numPeaks: 750,
                getCrossChannelPeaks: true
            };
            wwiseAudioFileSource.waapiJS.query( "ak.wwise.core.audioSourcePeaks.getMinMaxPeaksInTrimmedRegion", query ).then( function(res) {
                console.log("Fetched minmaxpeaks for audio source " + wwiseAudioFileSource.guid);
                console.log("Peaks: ", res);
            });
        });
    }
}

class WwiseSoundbank extends WwiseObject
{
    constructor(basicInfo, waapiJS, debug = false)
    {
        super(basicInfo, waapiJS, debug);

        this.inclusionsIDs = [];

        var query = {
            soundbank: this.guid
        };
        var wwiseSoundbank = this;
        this.waapiJS.query( "ak.wwise.core.soundbank.getInclusions", query ).then( function(res) {
            console.log("Fetched inclusions for SoundBank " + wwiseSoundbank.guid);
            wwiseSoundbank.initInclusions(res.kwargs["inclusions"]);
        });
    }

    initInclusions(res)
    {
        for( let i=0; i<res.length; i++ ) {
            this.inclusionsIDs.push( res[i].object );
        }
    }

    includesObjectID(objectID)
    {
        return this.inclusionsIDs.indexOf(objectID) > -1;
    }
}

class WwiseAttenuationsFolder extends WwiseObject
{
    constructor(basicInfo, waapiJS, debug = false)
    {
        super(basicInfo, waapiJS, debug);

        this.childrenToCommit = [];
    }

    fetchChildren()
    {
        var wwiseAttenuationsFolder = this;
        return super.fetchChildren().then(function() {
            return wwiseAttenuationsFolder.sortChildrenByRadius();
        })
    }

    // override to allow fetching each attenuation parents & data before fetching next
    fetchNextChildObject()
    {
        if( this.childrenToFetch.length < 1 ) return;
        let nextChild = this.childrenToFetch.shift();
        let newAttenuation = this.makeChildObject(nextChild);
        this.childrenObjects.push(newAttenuation);

        let wwiseAttenuationsFolder = this;
        return newAttenuation.fetchParents().then(function() {
            return newAttenuation.fetchWwiseData();
        }).then(function() {
            return wwiseAttenuationsFolder.fetchNextChildObject();
        })
    }

    // override makeChildObject to create WwiseAttenuations
    makeChildObject(wwiseObject)
    {
        return new WwiseAttenuation(wwiseObject, this.waapiJS);
    }

    getShortest()
    {
        let shortest = undefined;
        for( let i=0; i < this.childrenObjects.length; i++ )
            if( shortest == undefined || this.childrenObjects[i]["RadiusMax"] < shortest["RadiusMax"] )
                shortest = this.childrenObjects[i];
        return shortest;
    }

    getLongest()
    {
        let longest = undefined;
        for( let i=0; i < this.childrenObjects.length; i++ )
            if( longest == undefined || this.childrenObjects[i]["RadiusMax"] > longest["RadiusMax"] )
                longest = this.childrenObjects[i];
        return longest;
    }

    // checks whether interpolation is possible
    // between the shortest and longest attenuations in the folder
    getInterpolationErrors()
    {
        let errors = [];

        // checks whether folder is empty
        if( this.childrenObjects.length < 1) {
            return [ { name: "EmptyFolderError" } ];
        }

        // checks whether the minimum of 2 attenuations is present
        if( this.childrenObjects.length < 2) {
            let newError = {
                name: "LessThan2AttsError",
            }
            errors.push(newError);
        }

        let referenceAtt = this.getShortest();

        // store nb points for each curve of shortest attenuation
        let radii = [];
        let curvesToCheck = referenceAtt.curves;
        let curvesNbPoints = {};
        for( let curveType in curvesToCheck ) {
            let curCurve = curvesToCheck[ curveType ];
            curvesNbPoints[ curveType ] = curCurve.points.length;
        }

        // store shortest att. prefix
        let refIsValid = false;
        let refPrefix = "";
        if( referenceAtt.checkNameRadiusSuffixIndex() > -1 ) {
            refIsValid = true;
            refPrefix = referenceAtt.getNamePrefix();
        }

        // check each attenuation
        for( let i=0; i < this.childrenObjects.length; i++ )
        {
            let curAtt = this.childrenObjects[i];

            // check name has a valid suffix
            if( curAtt.checkNameRadiusSuffixIndex() < 0)
            {
                let newError = {
                    name: "MissingValidSuffixError",
                    attName: curAtt.name,
                    radius: curAtt.RadiusMax
                }
                errors.push(newError);
            }

            // check name has same prefix as shortest attenuation
            if( refIsValid && curAtt.getNamePrefix() != refPrefix)
            {
                let newError = {
                    name: "InvalidPrefixError",
                    attName: curAtt.name,
                    radius: curAtt.RadiusMax,
                    correctPrefix: refPrefix
                }
                errors.push(newError);
            }

            // check no radius is the same
            if( radii.indexOf( curAtt.RadiusMax ) < 0 )
                radii.push( curAtt.RadiusMax );
            else {
                let newError = {
                    name: "MultipleSimilarRadiiError",
                    attName: curAtt.name,
                    radius: curAtt.RadiusMax
                }
                errors.push(newError);
            }

            // check all curves have the correct number of points
            for( let curveType in curAtt.curves )
            {
                let curCurve = curAtt.curves[ curveType ];
                if( curCurve.points.length != curvesNbPoints[ curveType ] ) {
                    let newError = {
                        name: "InconsistentPointsNbError",
                        attName: curAtt.name,
                        curveType: curveType,
                        correctNbPoints: curvesNbPoints[ curveType ],
                        foundNbPoints: curCurve.points.length
                    }
                    errors.push(newError);
                }
            }
        }

        return errors;
    }

    sortChildrenByRadius()
    {
        console.log("sorting");
        this.childrenObjects.sort(function(a,b) {
            return a["RadiusMax"] - b["RadiusMax"];
        });
    }

    existsInFolder(attName)
    {
        for( let i=0; i < this.childrenObjects.length; i++ )
            if( this.childrenObjects[i].name == attName )
                return true;
        return false;
    }

    getAttenuationByName(attName)
    {
        for( let i=0; i < this.childrenObjects.length; i++ )
            if( this.childrenObjects[i].name == attName )
                return this.childrenObjects[i];
        return undefined;
    }

    createAttenuation(object)
    {
        let newAtt = new WwiseAttenuation(object, this.waapiJS);
        newAtt.parent = this;
        this.childrenObjects.push(newAtt);
        return newAtt;
    }

    removeUncommittedAttenuations()
    {
        let i = this.childrenObjects.length;
        while( i-- ) {
            if( !this.childrenObjects[i].guid ) {
                this.childrenObjects.splice(i, 1);
            }
        }
    }

    storeInterpolationShapes()
    {
        this.notes = this.getShortest().serializeInterpolationShapes();
    }

    commit()
    {
        console.log("committing attenuation folder to wwise");
        let wwiseAttenuationsFolder = this;

        // commit wwise object, then...
        return super.commit().then(function() {
            // commit notes, then...
            return wwiseAttenuationsFolder.commitNotes().then(function() {
                // commit child attenuations
                for(let i=0; i < wwiseAttenuationsFolder.childrenObjects.length; i++)
                    wwiseAttenuationsFolder.childrenToCommit.push(wwiseAttenuationsFolder.childrenObjects[i]);
                return wwiseAttenuationsFolder.commitNextChildAttenuation();
            });
        })
    }

    commitNextChildAttenuation()
    {
        if( this.childrenToCommit.length < 1) {
            console.log("All attenuations committed for " + this.name);
            return;
        }
        let nextChildToCommit = this.childrenToCommit.shift();
        let wwiseAttenuationsFolder = this;
        return nextChildToCommit.commit().then(function() {
            return wwiseAttenuationsFolder.commitNextChildAttenuation();
        });
    }
}

class WwiseAttenuation extends WwiseObject
{
    constructor(basicInfo, waapiJS, debug = false)
    {
        super(basicInfo, waapiJS, debug);

        this.curves = {};
        this.curveTypes = [
            "VolumeDryUsage",
            "VolumeWetGameUsage",
            "VolumeWetUserUsage",
            "LowPassFilterUsage",
            "HighPassFilterUsage",
            "SpreadUsage",
            "FocusUsage"
        ];

        this.curvesToFetch = [];
        this.curvesToCommit = [];
    }

    fetchWwiseData()
    {
        var query = {
            from:{id:[this.guid]}
        };
        var options = {
            return: ['@RadiusMax'] // TODO: fetch cone attenuation parameters
        }
        var wwiseAttenuation = this;
        return this.waapiJS.queryObjects(query, options).then(function(res) {
            console.log("fetchWwiseAttData", res);
            wwiseAttenuation.RadiusMax = res.kwargs.return[0]["@RadiusMax"];
            wwiseAttenuation.curvesToFetch = wwiseAttenuation.curveTypes;
            return wwiseAttenuation.fetchNextAttenuationCurve();
        });
    }

    // recursively fetching all attenuation curves
    fetchNextAttenuationCurve()
    {
        if( this.curvesToFetch.length < 1 ) return;
        let wwiseAttenuation = this;
        let nextCurveName = this.curvesToFetch.shift();
        let query = {
            object: this.guid,
            curveType: nextCurveName
        };
        return this.waapiJS.query( "ak.wwise.core.object.getAttenuationCurve", query ).then( function(res) {
            //console.log("Fetched curve " + nextCurveName + " for Attenuation " + wwiseAttenuation.path);
            wwiseAttenuation.curves[nextCurveName] = new WwiseAttenuationCurve(wwiseAttenuation, res.kwargs);
            return wwiseAttenuation.fetchNextAttenuationCurve();
        });
    }

    interpolate(startAtt, endAtt, ratio)
    {
        //console.log(this.name + " interpolating between " + startAtt.name + " and " + endAtt.name + " at ratio " + ratio);
        for(let curveName in startAtt.curves)
        {
            let curveInit = {
                curveType: curveName,
                points: startAtt.curves[ curveName ].points,
                use: startAtt.curves[ curveName ].use
            }
            this.curves[ curveName ] = new WwiseAttenuationCurve(this, curveInit);
            this.curves[ curveName ].interpolate(startAtt.curves[ curveName ], endAtt.curves[ curveName ], ratio);
        }
    }

    serializeInterpolationShapes()
    {
        let curvesShapes = [];
        for(let curveName in this.curves)
        {
            curvesShapes.push(curveName + ":" + this.curves[ curveName ].getSerializedInterpolationShapes());
        }
        return curvesShapes.join("/");
    }

    unserializeInterpolationShapes()
    {
        if( this.parent.notes == undefined )
            return {}

        let splitCurvesSetShapes = this.parent.notes.split("/");
        if( splitCurvesSetShapes.length < 2 )
            return {}

        let curvesSetShapes = {};
        for( let i=0; i < splitCurvesSetShapes.length; i++ ) {
            let splitSingleCurveShapes = splitCurvesSetShapes[i].split(":");
            if( splitSingleCurveShapes.length > 1 )
            {
                let curveName = splitSingleCurveShapes[0];
                let splitPointsSetShapes = splitSingleCurveShapes[1].split(",");
                if( splitPointsSetShapes.length > 1 )
                    curvesSetShapes[ curveName ] = splitPointsSetShapes;
            }
        }
        return curvesSetShapes;
    }

    commit()
    {
        let wwiseAttenuation = this;
        return super.commit().then(function() {
            console.log("attenuation " + wwiseAttenuation.name + " committed");
        }).then(function() {
            return wwiseAttenuation.commitProperty("RadiusMax");
        }).then(function() {
            return wwiseAttenuation.commitNotes();
        }).then(function() {
            console.log("radius " + wwiseAttenuation.RadiusMax + " committed for attenuation " + wwiseAttenuation.name);
        }).then(function() {
            //return wwiseAttenuation.commitCurves();
            wwiseAttenuation.curvesToCommit = wwiseAttenuation.curveTypes;
            return wwiseAttenuation.commitNextCurve();
        });
    }

    commitNextCurve()
    {
        if( this.curvesToCommit.length < 1 ) {
            console.log("All curves committed for " + this.name);
            this.refreshViews();
            return;
        }
        let nextCurve = this.curves[ this.curvesToCommit.shift() ];
        let wwiseAttenuation = this;
        return nextCurve.commit().then(function(){
            return wwiseAttenuation.commitNextCurve();
        });
    }

    commitCurves()
    {
        for(let curveType in this.curves) {
            this.curves[ curveType ].commit();
        }
    }

    getPoint(curveType, index)
    {
        return this.curves[curveType].getPoint(index);
    }

    // checks if a radius suffix (...20m, ...100m, etc.) is present in the attenuation's name
    // and returns its index
    checkNameRadiusSuffixIndex()
    {
        let match = this.name.match(/\d+m$/);
        if( match != null ) return match.index;
        else return -1;
    }

    // gets the part of the name excluding its radius suffix
    getNamePrefix()
    {
        let suffixIndex = this.checkNameRadiusSuffixIndex();
        if( suffixIndex < 0 )
            suffixIndex = this.name.length - 1;
        return this.name.substring(0, suffixIndex);
    }
}

class WwiseAttenuationCurve
{
    constructor(parentAttenuation, object)
    {
        this.curveType = object.curveType;

        // get the curve's points' interpolation shapes from unserialized attenuation notes
        let unserializedInterpolationShapes = parentAttenuation.unserializeInterpolationShapes();
        let curveInterpolationShapes = [];
        if( unserializedInterpolationShapes[ this.curveType ] != undefined )
            curveInterpolationShapes = unserializedInterpolationShapes[ this.curveType ];

        this.points = this.initPoints(object.points, curveInterpolationShapes);
        this.use = object.use;
        this.dB = this.curveType.indexOf("Volume") > -1 ? true : false;
        this.parent = parentAttenuation;
    }

    initPoints(points, interpolationShapes)
    {
        let returnPoints = [];
        if( points )
            for( let i=0; i < points.length; i++ ) {
                let newPoint = new WwiseAttenuationCurvePoint(points[i]);

                // set the point's interpolation shape from unserialized notes
                if( interpolationShapes[i] != undefined )
                    newPoint.interpolationShape = interpolationShapes[i];

                returnPoints.push(newPoint);
            }
        return returnPoints;
    }

    interpolate(startCurve, endCurve, ratio)
    {
        if( startCurve.points.length != endCurve.points.length ) {
            console.error("Can't interpolate: mismatch in number of points between " + this.curveType + " curves");
            return;
        }

        for( let i=0; i < startCurve.points.length; i++ ) {
            this.points[i].interpolate(startCurve.points[i], endCurve.points[i], ratio, this.dB);
            // snap last point.x of curve to attenuation max radius to avoid approx error
            if( i == startCurve.points.length-1 )
                this.points[i].x = this.parent.RadiusMax;
        }
    }

    commit()
    {
        let query = {
            object: this.parent.guid,
            curveType: this.curveType,
            use: this.use,
            points: this.getBasicPoints()
        }
        var wwiseObject = this;
        return this.parent.waapiJS.query(ak.wwise.core.object.setAttenuationCurve, query);
    }

    // gets points with their basic properties, without any properties wwise considers as invalid
    getBasicPoints()
    {
        let basicPoints = [];
        for( let i=0; i < this.points.length; i++ ) {
            basicPoints.push( this.points[i].getBasic() );
        }
        return basicPoints;
    }

    getPoint(index)
    {
        return this.points[index];
    }

    getSerializedInterpolationShapes()
    {
        let shapes = [];
        for( let i=0; i < this.points.length; i++ ) {
            shapes.push(this.points[i].interpolationShape);
        }
        return shapes.join(",");
    }
}

class WwiseAttenuationCurvePoint
{
    constructor(point)
    {
        this.x = point.x;
        this.y = point.y;
        this.shape = point.shape;
        this.interpolationShape = "linear";
    }

    interpolate(startPoint, endPoint, ratio, dB)
    {
        this.x = WwiseUtils.lerp(startPoint.x, endPoint.x, ratio);
        let easedRatio = EasingFunctions[ startPoint.interpolationShape ](ratio);
        this.y = dB ? WwiseUtils.lerp_dB(startPoint.y, endPoint.y, easedRatio) : WwiseUtils.lerp(startPoint.y, endPoint.y, easedRatio);
        this.interpolationShape = startPoint.interpolationShape;
    }

    // gets the object as a basic object without properties wwise considers as invalid
    getBasic()
    {
        return {
            x: this.x,
            y: this.y,
            shape: this.shape
        }
    }
}

class WwiseUtils
{
    static lerp(src, tgt, r) {
        return src + r * (tgt - src);
    }

    static lerp_dB(src, tgt, r) {
        let srcRatio = WwiseUtils.dBValueToRatio(src);
        let tgtRatio = WwiseUtils.dBValueToRatio(tgt);
        let lerped = WwiseUtils.lerp(srcRatio, tgtRatio, r);
        let lerped_dB = WwiseUtils.ratioTodBValue(lerped);
        return lerped_dB;
    }

    static dBValueToRatio(dBvalue) {
        return Math.pow(10, (dBvalue / 20));
    }

    static ratioTodBValue(ratio) {
        return 20 * Math.log10(ratio);
    }
}

EaseIn = function(power) {
    return function(t) {
        return Math.pow(t, power)
    }
};

EaseOut = function(power) {
    return function(t) {
        return 1 - Math.abs(Math.pow(t-1, power))
    }
};

EaseInOut = function(power) {
    return function(t) {
        return t<.5 ? EaseIn(power)(t*2)/2 : EaseOut(power)(t*2 - 1)/2+0.5
    }
}

EasingFunctions = {
  linear: EaseInOut(1),
  easeInQuad: EaseIn(2),
  easeOutQuad: EaseOut(2),
  easeInOutQuad: EaseInOut(2),
  easeInCubic: EaseIn(3),
  easeOutCubic: EaseOut(3),
  easeInOutCubic: EaseInOut(3),
  easeInQuart: EaseIn(4),
  easeOutQuart: EaseOut(4),
  easeInOutQuart: EaseInOut(4),
  easeInQuint: EaseIn(5),
  easeOutQuint: EaseOut(5),
  easeInOutQuint: EaseInOut(5)
}

class WaapiJS
{
    constructor(onConnected)
    {
        console.log("Building WaapiJS");

        this.session = undefined;
        this.onConnected = onConnected;
        this.connection = new autobahn.Connection({
            url: 'ws://localhost:8080/waapi',
            realm: 'realm1',
            protocols: ['wamp.2.json']
        });

        var waapiJS = this;
        this.connection.onclose = function(reason, details) { waapiJS.onConnectionClose(reason, details); }
        this.connection.onopen = function(session) { waapiJS.onConnectionOpen(session); }
        this.connection.open();
    }

    onConnectionClose(reason, details)
    {
        console.log('WAMP connection closed', reason, details);
        return true;
    }

    onConnectionOpen(session)
    {
        console.log('WAMP connection opened');
        var waapiJS = this;
        this.session = session;
        this.session.call(ak.wwise.core.getInfo, [], {}).then(
            function(res) {
                console.log(`WaapiJS connected to ${res.kwargs.displayName} ${res.kwargs.version.displayName}`);
            },
            function(error) {
                waapiJS.onCallError(error);
            }
        );
        this.onConnected();
    }

    onCallError(error, query = {})
    {
        console.error("Call error");
        console.log(error);
        console.log("query object:", query);
    }

    query(uri, query = {}, options = {})
    {
        var waapiJS = this;

        // call query
        return this.session.call(uri, [], query, options).then(
            function(res) { return res; },
            function(error) { waapiJS.onCallError(error, query); }
        );
    }

    queryObjects(query, options = {})
    {
        // minimum fields to return
        var minReturnFields = ['id', 'name', 'type', 'path', 'category', 'notes']
        if(options == {} || options.return == undefined || options.return.length < 1)
            options.return = minReturnFields;
        else for( let i=0; i < minReturnFields.length; i++ )
            if( options.return.indexOf( minReturnFields[i] ) < 0 )
                options.return.push( minReturnFields[i] );

        return this.query(ak.wwise.core.object.get, query, options);
    }

    queryFamily(guid, selectType)
    {
        var query = {
            from:{id:[guid]},
            transform:[{select:[selectType]}]
        };
        return this.queryObjects(query)
    }

    querySelectedObjects()
    {
        var query = {};
        var options = {
            return: ['id', 'name', 'type', 'path', 'category']
        };
        return this.query(ak.wwise.ui.getSelectedObjects, query, options).then(function(res) {
            return res.kwargs.objects;
        });
    }

    getActorMixerHierarchy()
    {
        var query = {
            from:{path:['\\Actor-Mixer Hierarchy']},
            transform:[
                {select:['descendants']}
            ]
        };
        var options = {
            return: ['id', 'name', 'type', 'path', 'parent']
        };
        return this.queryObjects(query, options);
    }

    getProjectName()
    {
        var query = {
            from:{ofType:['Project']},
        };
        return this.queryObjects(query).then(function(res) {
            return res.kwargs.return[0].name;
        });
    }

    findInProjectExplorer(path)
    {
        var query = {
            "command": "FindInProjectExplorerSyncGroup1",
            "objects": [ path ]
        };
        return this.query(ak.wwise.ui.commands.execute, query);
    }

    subscribeSelectionChanged(callback)
    {
        this.session.subscribe(ak.wwise.ui.selectionChanged, callback).then(
            function(subscription) {
                console.log("Successfully subscribed to selection change");
                console.log(subscription);
            },
            function(error) {
                console.error("Failed subscribing to selection change");
                console.error(error);
            }
        );
    }
}
