class Renamer extends WwiseActorMixerObject
{
    constructor(basicInfo, waapiJS, debug = false)
    {
        super(basicInfo, waapiJS, debug);
        console.log("Building Renamer from Wwise Object " + this.guid + " - " + this.name);
    }

    init(basicInfo)
    {
        super.init(basicInfo);
        this.referencesToFetch = [];
        this.referenceObjects = [];
        this.objectsToCommit = [];

        // to rename self without refreshing whole renamer view:
        this.selfObject = new WwiseActorMixerObject(basicInfo, waapiJS);
    }

    reset()
    {
        super.reset();
        this.selfObject.reset();
    }

    fetchWwiseData()
    {
        var renamer = this;
        return super.fetchWwiseData(true).then(function() {
            return renamer.getReferences().then(function(res) {
                renamer.referencesToFetch = res.kwargs.return;
                return renamer.fetchNextReference();
            });
        })
    }

    // TODO: promote to WwiseObject method?
    fetchNextReference()
    {
        if( this.referencesToFetch.length < 1 )
            return;

        let nextRef = this.referencesToFetch.shift();
        let renamer = this;

        // filter out references that aren't actions (e.g. soundbanks)
        if(nextRef.type != "Action")
            return renamer.fetchNextReference();

        // store parent event of each action reference as the actual reference
        let newPlayAction = new WwiseAction(nextRef, this.waapiJS);
        return newPlayAction.fetchWwiseData().then(function() {
            renamer.referenceObjects.push(newPlayAction.parent);
            return renamer.fetchNextReference();
        })
    }

    searchAndReplaceInNames(find, repl)
    {
        this.selfObject.searchAndReplaceInName(find, repl);
        for(let i=0; i<this.childrenObjects.length; i++)
            this.childrenObjects[i].searchAndReplaceInName(find, repl);
        for(let i=0; i<this.referenceObjects.length; i++)
            this.referenceObjects[i].searchAndReplaceInName(find, repl);
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
            for(let i=0; i < renamer.referenceObjects.length; i++)
                renamer.objectsToCommit.push(renamer.referenceObjects[i]);
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
