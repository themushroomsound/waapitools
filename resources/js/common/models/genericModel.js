// Base class for all wwise objects
class GenericModel
{
    constructor()
    {
        this.views = [];
    }

    refreshViews()
    {
        for(let i=0; i < this.views.length; i++)
            this.views[i].refresh();
    }
}
