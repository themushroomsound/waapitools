class RenamerView extends WwiseObjectView
{
    constructor(htmlElement)
    {
        super(htmlElement);

        // referencing events list
        this.referencesTable = $(this.htmlElement).find("#references");
        // children list
        this.childrenTable = $(this.htmlElement).find("#children");
        // input fields
        this.findReplaceInputs = $(this.htmlElement).find("#findReplaceInputs");

        this.refresh();
    }

    reset()
    {
        super.reset();
        this.findReplaceInputs.hide();
        this.childrenTable.html("<tr><td>none</td></tr>");
        this.referencesTable.html("<tr><td>none</td></tr>");
    }

    populate()
    {
        super.populate();
        this.findReplaceInputs.show();
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
            newRow.appendTo(table);
        }
    }
}
