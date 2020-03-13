class GenericView
{
    constructor(htmlElement)
    {
        this.htmlElement = htmlElement;
        //this.refresh();
    }

    setObject(object)
    {
        this.object = object;
        if( this.object )
            this.object.views.push(this);
        this.refresh();
    }

    hide()
    {
        $(this.htmlElement).hide();
    }

    show()
    {
        $(this.htmlElement).show();
    }

    refresh()
    {
        this.reset();
        if( !this.object )
            return;
        this.populate();
    }

    reset()
    {

    }

    populate()
    {

    }
}
