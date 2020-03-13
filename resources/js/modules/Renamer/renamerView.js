class RenamerPendingChangeView extends WwiseObjectView
{

}

class RenamerView extends WwiseObjectView
{
    constructor(htmlElement)
    {
        super(htmlElement);

        // referencing events list
        this.referencesTable = $(this.htmlElement).find("#references tbody");
        // children list
        this.childrenTable = $(this.htmlElement).find("#children tbody");
        // input fields
        this.findReplaceInputs = $(this.htmlElement).find("#findReplaceInputs");
        this.findInput = $(this.htmlElement).find("#findReplaceInputs #find");
        this.replaceInput = $(this.htmlElement).find("#findReplaceInputs #replace");
        this.refresh();
    }

    reset()
    {
        super.reset();
        this.findReplaceInputs.hide();
        this.childrenTable.html("<tr><td>-</td><td>-</td><td>-</td></tr>");
        this.referencesTable.html("<tr><td>-</td><td>-</td><td>-</td></tr>");
    }

    populate()
    {
        super.populate();

        this.findReplaceInputs.show();
        let renamer = this;
        this.findInput.on('input', function() { renamer.onInputChange(); });
        this.replaceInput.on('input', function() { renamer.onInputChange(); });

        this.populateTable(this.childrenTable, this.wwiseObject.childrenObjects);
        this.populateTable(this.referencesTable, this.wwiseObject.referenceObjects);
    }

    populateTable(table, data)
    {
        if( data.length < 1 )
            return;

        table.html("");
        for(let index in data)
        {
            var newRow = $("#template_wwiseObjectRow").contents().clone();
            newRow.find(".type").append( data[index].type );
            newRow.find(".objectName").append( data[index].getObjLink(false) );
            newRow.find(".newObjectName").append( data[index].getObjLink(false) );
            newRow.appendTo(table);
        }
    }

    onInputChange()
    {
        let findStr = this.findInput.val();
        let replStr = this.replaceInput.val();
        console.log("replacing [" + findStr + "] with [" + replStr + "]");
    }
}
