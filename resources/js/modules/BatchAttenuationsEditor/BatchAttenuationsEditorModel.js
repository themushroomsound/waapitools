class BatchAttenuationsEditorModel extends GenericModel
{
    constructor(selectedObjects, waapiJS, debug = false)
    {
        super();
        this.wwiseObject = new WwiseAttenuationsFolder(selectedObjects[0], waapiJS, debug);
    }

    get viewObject()
    {
        return this.wwiseObject;
    }
}