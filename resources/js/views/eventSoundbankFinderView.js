class EventSoundbankFinderView extends WwiseObjectView
{
    constructor(htmlElement)
    {
        super(htmlElement);
    }

    refresh()
    {
        super.refresh();

        var inclusions = this.wwiseObject.getSoundBankInclusions();
        var inclusionsTable = $(this.htmlElement).find(".soundbankInclusions");

        $(this.htmlElement).find(".nbInclusions").text(inclusions.length);
        if( inclusions.length < 1 )
            inclusionsTable.html("<tr><td>none</td></tr>");

        else {
            inclusionsTable.html("");
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

                newRow.appendTo(inclusionsTable);
            }
        }
    }
}
