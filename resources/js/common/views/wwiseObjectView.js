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

    reset()
    {
        $(this.htmlElement).find(".name").html("none");
    }

    populate()
    {
        if( !this.wwiseObject )
            return;

        $(this.htmlElement).find(".type").html(this.wwiseObject.type);
        $(this.htmlElement).find(".guid").html(this.wwiseObject.guid);
        $(this.htmlElement).find(".name").html(this.wwiseObject.guid ? this.wwiseObject.getObjLink() : this.wwiseObject.name);
        $(this.htmlElement).find(".path").html(this.wwiseObject.guid ? this.wwiseObject.getObjLink(true) : this.wwiseObject.path);
        $(this.htmlElement).find(".errorsList").html(this.wwiseObject.errors);

        if(this.wwiseObject.guid)
        {
            $(this.htmlElement).find(".btn_copy_id").attr("data-tocopy", this.wwiseObject.guid);
            $(this.htmlElement).find(".btn_copy_path").attr("data-tocopy", this.wwiseObject.path);
        }
    }
}
