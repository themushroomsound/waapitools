class WwiseObjectView extends GenericView
{
    constructor(htmlElement)
    {
        super(htmlElement);
    }

    setWwiseObject(wwiseObject)
    {
        this.wwiseObject = wwiseObject;
        super.setObject(wwiseObject);
    }

    refresh()
    {
        super.refresh();

        if( this.wwiseObject )
            $(this.htmlElement).find(".name").html(this.wwiseObject.getObjLink());
        else
            $(this.htmlElement).find(".name").html("none");
    }
}
