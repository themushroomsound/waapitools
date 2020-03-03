class GenericView
{
    constructor(htmlElement)
    {
        this.htmlElement = htmlElement;
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

    }
}
