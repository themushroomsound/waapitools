class UtilsView extends GenericView
{
    constructor(htmlElement)
    {
        super(htmlElement);

        // input fields
        this.searchInput = $(this.htmlElement).find(".search");

        // selected objects list
        this.objectsTable = $(this.htmlElement).find("#selectedObjects tbody");        

        // commit button
        this.navigateButton = new GenericButton($(this.htmlElement).find("#btn_navigate"));

        let self = this;
        this.navigateButton.setClick(function(e) {
            self.onBtnNvigateClicked(e);
            return false;
        });

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.searchString = urlParams.get('linkerpath');
        this.searchInput.val(this.searchString);

        this.refresh();
    }

    populate()
    {
        this.objectsTable.html("");
        for(let index in this.object.wwiseObjects ) {
            var newRow = $("#template_utils_selectedObjectRow").contents().clone();
            var newObjectView = new WwiseObjectView(newRow);
            newObjectView.setWwiseObject(this.object.wwiseObjects[index]);
            newRow.appendTo(this.objectsTable);
        }
    }

    onBtnNvigateClicked(e)
    {
        let path = this.searchInput.val().trim();
        if (path.length > 0)
            this.object.waapiJS.findInProjectExplorer(path);
    }
    
}