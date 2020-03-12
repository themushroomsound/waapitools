class EventSoundbankFinderView extends WwiseObjectView
{
    constructor(htmlElement)
    {
        super(htmlElement);

        this.inclusionsTable = $(this.htmlElement).find(".soundbankInclusions");
        this.nbInclusions = $(this.htmlElement).find(".nbInclusions");
    }

    reset()
    {
        super.reset();
        this.nbInclusions.text(0);
        this.inclusionsTable.html("<tr><td>none</td></tr>");
    }

    populate()
    {
        super.populate();

        var inclusions = this.wwiseObject.getSoundBankInclusions();
        $(this.htmlElement).find(".nbInclusions").text(inclusions.length);

        if( inclusions.length < 1 )
            return;

        this.inclusionsTable.html("");
        for( let i=0; i < inclusions.length; i++ )
        {
            var newRow = $("#template_inclusionRow").contents().clone();
            newRow.find(".soundbankName").append( inclusions[i].soundbank.getObjLink(true) );

            if( inclusions[i].object.guid == this.wwiseObject.guid )
                newRow.find(".inclusionType").text( "direct inclusion" );
            else {
                newRow.find(".inclusionType").text( "included via " );
                newRow.find(".inclusionObjectName").append( inclusions[i].object.getObjLink(true) );
            }

            newRow.appendTo(this.inclusionsTable);
        }
    }
}
