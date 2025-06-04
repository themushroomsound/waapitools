class Utils extends GenericModel
{
    constructor(selectedObjects, waapiJS, debug = false)
    {
        super();
        this.wwiseObject = new WwiseObject(selectedObjects[0], waapiJS, debug);
    }

    get viewObject()
    {
        return this.wwiseObject;
    }
}