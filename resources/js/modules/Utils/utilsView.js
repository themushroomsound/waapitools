class UtilsView extends WwiseObjectView
{
    constructor(htmlElement)
    {
        super(htmlElement);

        // input fields
        this.searchInput = $(this.htmlElement).find(".search");

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

    onBtnNvigateClicked(e)
    {
        let path = this.searchInput.val().trim();
        if (path.length > 0)
            this.wwiseObject.waapiJS.findInProjectExplorer(path);
    }
    
}