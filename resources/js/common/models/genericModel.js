// Base class for all models
class GenericModel
{
    constructor()
    {
        this.views = [];
    }

    // override if the view needs to be bound to a child object
    get viewObject()
    {
        return this;
    }

    refreshViews()
    {
        for(let i=0; i < this.views.length; i++)
            this.views[i].refresh();
    }
}
