class NotesReviewView extends GenericView
{
    constructor(htmlElement)
    {
        super(htmlElement);
        // TODO: rename childrenTable, these are not children
        this.childrenTable = $(this.htmlElement).find(".notes");
    }

    setModel(notesReviewModel)
    {
        this.notesReviewModel = notesReviewModel;
        super.setObject(notesReviewModel);
    }

    reset()
    {
        super.reset();
        this.childrenTable.html("<tr><td>none</td></tr>");
    }

    populate()
    {
        super.populate();
        var objectsWithNotes = this.notesReviewModel.objectsWithNotes;
        if( objectsWithNotes.length > 0 )
        {
            this.childrenTable.html("");
            for(let index in objectsWithNotes ) {
                var newRow = $("#template_notesRow").contents().clone();
                newRow.find(".objectName").append( objectsWithNotes[index].getObjLink(false) );
                var notes = objectsWithNotes[index].notes.replace("TODO", '<span class="todo">TODO</span>');
                newRow.find(".notes").html( notes );
                newRow.appendTo(this.childrenTable);
            }
        }
    }
}
