class EventSoundbankFinder extends WwiseEvent
{
    constructor(basicInfo, waapiJS, debug = false)
    {
        super(basicInfo, waapiJS, debug);
    }

    fetchData()
    {
        return this.fetchParents(true);
    }
}
