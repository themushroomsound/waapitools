class Renamer extends WwiseActorMixerObject
{
    init(basicInfo)
    {
        super.init(basicInfo);
        this.objectsToCommit = [];
        // to rename self without refreshing whole renamer view:
        this.selfObject = new WwiseActorMixerObject(basicInfo, waapiJS);
    }

    reset()
    {
        super.reset();
        this.selfObject.reset();
    }

    fetchData()
    {
        let self = this;
        return this.fetchReferences().then(function() {
            return self.fetchChildren(true);
        }).then(function() {
            return self.fetchReferenceEvents();
        }).then(function() {
            console.log("Done initializing Renamer: ", self);
        });
    }

    // to be overriden if child object needs a particular initialization
    processNewChildObject(childObject)
    {
        let newChildObject = this.makeChildObject(childObject);
        let self = this;
        return newChildObject.fetchReferences().then(function() {
            self.childrenObjects.push(newChildObject);
            self.referenceObjects = self.referenceObjects.concat(newChildObject.referenceObjects);
        });
    }

    fetchReferenceEvents()
    {
        this.referenceEventsToFetch = [];
        this.referenceEventObjects = [];
        // gather play actions among references objects
        for(let i=0; i<this.referenceObjects.length; i++)
        {
            let refObj = this.referenceObjects[i];
            if(refObj.source.type == "Action")
                this.referenceEventsToFetch.push(refObj);
        }
        // start fetching each action's parent
        return this.fetchNextReferenceEvent();
    }

    fetchNextReferenceEvent()
    {
        if( this.referenceEventsToFetch.length < 1 ) return;
        let nextRef = this.referenceEventsToFetch.shift();
        let self = this;
        let newAction = new WwiseAction(nextRef.source, this.waapiJS);
        return newAction.fetchParents(false).then(function() {
            self.referenceEventObjects.push(newAction.parent);
            return self.fetchNextReferenceEvent();
        });
    }

    getReferenceEvents()
    {
        return [];
    }

    searchAndReplaceInNames(find, repl)
    {
        this.selfObject.searchAndReplaceInName(find, repl);
        for(let i=0; i<this.childrenObjects.length; i++)
            this.childrenObjects[i].searchAndReplaceInName(find, repl);
        for(let i=0; i<this.referenceObjects.length; i++)
            this.referenceEventObjects[i].searchAndReplaceInName(find, repl);
    }

    commitNames()
    {
        console.log("committing selected object, its children and events to wwise");
        let renamer = this;

        // commit wwise object, then...
        return this.selfObject.commitName().then(function() {
            // commit its children and references
            for(let i=0; i < renamer.childrenObjects.length; i++)
                renamer.objectsToCommit.push(renamer.childrenObjects[i]);
            for(let i=0; i < renamer.referenceEventObjects.length; i++)
                renamer.objectsToCommit.push(renamer.referenceEventObjects[i]);
            return renamer.commitNextObjectName();
        }).then(function() {
            console.log("all committed");
            renamer.reset();
        });;
    }

    commitNextObjectName()
    {
        if( this.objectsToCommit.length < 1) {
            console.log("All objects committed for " + this.name);
            return;
        }
        let nextObjectToCommit = this.objectsToCommit.shift();
        let renamer = this;
        return nextObjectToCommit.commitName().then(function() {
            return renamer.commitNextObjectName();
        });
    }
}
