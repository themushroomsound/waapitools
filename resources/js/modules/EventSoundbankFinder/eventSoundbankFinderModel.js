class EventSoundbankFinder extends GenericModel
{
    constructor(selectedObjects, waapiJS, debug = false)
    {
        super();
        this.wwiseObject = new EventSoundbankFinderWwiseObject(selectedObjects[0], waapiJS, debug);
    }

    get viewObject()
    {
        return this.wwiseObject;
    }
}

class EventSoundbankFinderWwiseObject extends WwiseEvent
{
    isValid()
    {
        if( this.type != "Event" )
            return false;
        return true;
    }

    fetchData()
    {
        let self = this
        return super.fetchData().then(function() {
            return self.fetchParents(false);
        }).then(function() {
            return self.fetchReferences();
        }).then(function() {
            self.referenceObjects = self.referenceObjects.concat( self.parent.referenceObjects );
            console.log("Done initializing EventSoundbankFinder: ", self);
        });
    }

    // override if reference object needs a particular initialization
    processNewParentObject(parentObject)
    {
        this.parent = this.makeParentObject(parentObject);
        return this.parent.fetchData();
    }

    // to be overriden by classes that need a specific class of parent object
    makeParentObject(wwiseObject)
    {
        return new EventSoundbankFinderAncestor(wwiseObject, this.waapiJS, true);
    }

    getSoundBankInclusions()
    {
        var soundbankInclusions = [];
        for(let i=0; i<this.referenceObjects.length; i++)
        {
            let curRef = this.referenceObjects[i];
            if(curRef.source.type == "SoundBank")
                soundbankInclusions.push(curRef);
        }
        return soundbankInclusions;
    }
}

class EventSoundbankFinderAncestor extends WwiseObject
{
    fetchData()
    {
        let self = this
        return this.fetchParents(false).then(function() {
            return self.fetchReferences();
        }).then(function() {
            if(self.parent != undefined)
                self.referenceObjects = self.referenceObjects.concat( self.parent.referenceObjects );
        });
    }

    // override if reference object needs a particular initialization
    processNewParentObject(parentObject)
    {
        this.parent = this.makeParentObject(parentObject);
        return this.parent.fetchData();
    }

    // to be overriden by classes that need a specific class of parent object
    makeParentObject(wwiseObject)
    {
        return new EventSoundbankFinderAncestor(wwiseObject, this.waapiJS, true);
    }
}
