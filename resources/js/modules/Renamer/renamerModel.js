class Renamer extends WwiseActorMixerObject
{
    constructor(basicInfo, waapiJS)
    {
        super(basicInfo, waapiJS);
        console.log("Building Renamer from Wwise Object " + this.guid + " - " + this.name);

        this.referencesToFetch = [];
        this.referenceObjects = [];
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

}
