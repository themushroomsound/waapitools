class WwiseObjectView extends GenericView
{
    constructor(htmlElement)
    {
        super(htmlElement);
    }

    setWwiseObject(wwiseObject)
    {
        this.wwiseObject = wwiseObject;
        if( this.wwiseObject )
            this.wwiseObject.views.push(this);
        this.refresh();
    }

    refresh()
    {
        if( this.wwiseObject )
            $(this.htmlElement).find(".name").html(this.wwiseObject.getObjLink());
        else
            $(this.htmlElement).find(".name").html("none");
    }
}
