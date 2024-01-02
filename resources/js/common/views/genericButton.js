class GenericButton extends GenericView
{
    constructor(htmlElement)
    {
        super(htmlElement);
    }

    enable()
    {
        this.htmlElement.removeClass("disabled");
        this.htmlElement.addClass("enabled");
        this.htmlElement.css("pointer-events", "auto");
    }

    disable()
    {
        this.htmlElement.removeClass("enabled");
        this.htmlElement.addClass("disabled");
        this.htmlElement.css("pointer-events", "none");
    }

    setClick(func)
    {
        this.htmlElement.unbind('click');
        this.htmlElement.click(func);
    }
}
