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
        this.reset();
        if( !this.wwiseObject )
            return;
        this.populate();
    }

    reset()
    {
        $(this.htmlElement).find(".name").html("none");
    }

    populate()
    {
        if( !this.wwiseObject )
            return;
        $(this.htmlElement).find(".name").html(this.wwiseObject.getObjLink());
    }
}
