class WwiseObjectView extends GenericView
{
    constructor(htmlElement)
    {
        super(htmlElement);
    }

    setObject(object)
    {
        this.setWwiseObject(object);
    }

    // TODO: get rid of this alias?
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
