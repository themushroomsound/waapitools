class GenericView
{
    constructor(htmlElement)
    {
        this.htmlElement = htmlElement;
    }

    hide()
    {
        $(this.htmlElement).hide();
    }

    show()
    {
        $(this.htmlElement).show();
    }
}
