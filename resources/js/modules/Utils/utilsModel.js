class Utils extends GenericModel
{
    constructor(selectedObjects, waapiJS, debug = false)
    {
        super();
        this.waapiJS = waapiJS;
        // make an array of wwise objects from the selected objects
        this.wwiseObjects = selectedObjects.map(obj => new WwiseObject(obj, waapiJS, debug));
    }

    fetchData()
    {
        // fetch data for all wwise objects
        return Promise.all(this.wwiseObjects.map(obj => obj.fetchData()));
    }
}