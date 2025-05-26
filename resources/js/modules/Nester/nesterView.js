class NesterView extends CreatorView
{
    constructor(htmlElement)
    {
        super(htmlElement);

        // mini view for wwise object name
        this.nameView = new WwiseObjectView($(this.htmlElement).find("#selfObjectName"));
        // children list
        this.childrenTable = $(this.htmlElement).find("#pendingChildren tbody");

        // input fields
        this.typeInput = $(this.htmlElement).find("#type");

        // commit button
        this.commitButton = new GenericButton($(this.htmlElement).find("#btn_commit"));

        let self = this;
        this.commitButton.setClick(function(e) {
            self.onBtnCommitClicked(e);
            return false;
        });

        this.typeInput.on('input', function() { self.onInputChange(); });

        this.refresh();
    }

    onInputChange()
    {
        let typeStr = this.typeInput.val();
        this.wwiseObject.createNewChildren(typeStr);
        this.populatePendingChildren();
    }

    // populate pending children
    populatePendingChildren()
    {
        this.childrenTable.html("");
        for(const child of this.wwiseObject.childrenObjects) {
            var newRow = $("#template_nesterPendingChildObjectRow").contents().clone();
            var newChildObjectView = new NesterChildView(newRow);
            newChildObjectView.setWwiseObject(child);
            newChildObjectView.setNestedObjects(this.wwiseObject.getSelectedObjectsToBeNested(child));
            newRow.appendTo(this.childrenTable);
        }
        this.commitButton.enable();
    }
}

class NesterChildView extends WwiseObjectView
{
    constructor(htmlElement)
    {
        super(htmlElement);

        // nested selected objects list
        this.nestedObjectsTable = $(this.htmlElement).find("table.nestedObjects tbody");
    }

    setNestedObjects(nestedObjects)
    {
        this.nestedObjectsTable.html("");
        for(const nestedObject of nestedObjects) {
            var newRow = $("#template_nestedObjectRow").contents().clone();
            var newSelectedObjectView = new WwiseObjectView(newRow);
            newSelectedObjectView.setWwiseObject(nestedObject);
            newRow.appendTo(this.nestedObjectsTable);
        }
    }
}
