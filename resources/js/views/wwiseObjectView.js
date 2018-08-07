class WwiseObjectView extends GenericView
{
    constructor(htmlElement)
    {
        super(htmlElement);
    }

    setWwiseObject(wwiseObject)
    {
        this.wwiseObject = wwiseObject;
        this.refresh();
    }

    refresh()
    {
        if( this.wwiseObject )
            $(this.htmlElement).find(".name").html(this.wwiseObject.getObjLink());
    }
}
