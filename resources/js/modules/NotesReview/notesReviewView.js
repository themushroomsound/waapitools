class NotesReviewView extends GenericView
{
    constructor(htmlElement)
    {
        super(htmlElement);
        this.childrenTable = $(this.htmlElement).find(".notes");
    }

    setModel(notesReviewModel)
    {
        this.notesReviewModel = notesReviewModel;
        this.refresh();
    }

    refresh()
    {
        this.childrenTable.html("<tr><td>none</td></tr>");

        if( !this.notesReviewModel )
            return;

        var objectsWithNotes = this.notesReviewModel.objectsWithNotes;
        if( objectsWithNotes.length > 0 )
        {
            this.childrenTable.html("");
            for(let index in objectsWithNotes ) {
                var newRow = $("#template_notesRow").contents().clone();
                newRow.find(".objectName").append( objectsWithNotes[index].getObjLink(true) );
                newRow.find(".notes").text( objectsWithNotes.notes );
                newRow.appendTo(this.childrenTable);
            }
        }
    }
}
