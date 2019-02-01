class SamplerKeymapperView extends WwiseObjectView
{
    constructor(htmlElement)
    {
        super(htmlElement);

        var samplerKeymapperView = this;

        // piano GUI
        this.pianoKeyboardElement = $(this.htmlElement).find(".pianoKeyboard");
        this.pianoKeyboard = new Piano(this.pianoKeyboardElement);
        // mapping errors
        this.mappingErrorsView = new GenericView($(this.htmlElement).find("#mappingErrorsView"));
        // commit button
        this.commitButton = new GenericButton($(this.htmlElement).find("#btn_commit"));

        this.commitButton.setClick(function(e) {
            samplerKeymapperView.onBtnCommitClicked(e);
            return false;
        });

        this.refresh();
    }

    refresh()
    {
        super.refresh();

        // hide/reset stuff
        this.mappingErrorsView.hide();
        this.commitButton.hide();
        this.pianoKeyboardElement.hide();
        this.pianoKeyboardElement.find(".sample").remove();

        if( !this.wwiseObject)
            return;

        var children = this.wwiseObject.childrenObjects;
        var childrenTable = $(this.htmlElement).find(".blendContainerChildren");

        if( children.length < 1 )
            childrenTable.html("<tr><td>none</td></tr>");

        else {
            childrenTable.html("");
            for(let index in children) {
                var pitch = children[index].pitch;

                var newRow = $("#template_blendContainerChildRow").contents().clone();
                newRow.find(".blendContainerName").append( children[index].getObjLink(true) );

                if( pitch == null ) {
                    newRow.find(".noteDetection").text( "- could not detect note from name" );
                    newRow.find(".detectedNoteIndex").hide();
                }
                else {
                    newRow.find(".noteDetection").text( "- detected note " );
                    newRow.find(".detectedNoteName").append( pitch.formattedNoteName );
                    newRow.find(".detectedNoteIndex span").append( pitch.midiNote );
                }

                newRow.appendTo(childrenTable);
            }
        }

        // if all good display mapping
        if( this.checkForErrors() )
        {
            this.pianoKeyboardElement.show();

            let parentTop = this.pianoKeyboardElement.position().top;
            let parentLeft = this.pianoKeyboardElement.position().left + parseInt(this.pianoKeyboardElement.css('marginLeft'));

            for(let index in children) {
                let sample = children[index];
                let sampleElement = $("#template_pianoSample").contents().clone();
                sampleElement.find(".range span").text(" " + children[index].name);
                let minRangeKey = this.pianoKeyboard.getKey(sample.MidiKeyFilterMin);
                let maxRangeKey = this.pianoKeyboard.getKey(sample.MidiKeyFilterMax);
                let leftPos = minRangeKey.position().left + parseInt(minRangeKey.css('marginLeft'));
                let rightPos = maxRangeKey.position().left + parseInt(maxRangeKey.css('marginLeft')) + maxRangeKey.width();
                let width = rightPos - leftPos;
                this.pianoKeyboardElement.append(sampleElement);
                sampleElement.find(".range").css("left", leftPos - parentLeft);
                sampleElement.find(".range").css("width", width);
            }

            this.commitButton.show();
        }

        this.commitButton.enable();
    }

    checkForErrors()
    {
        let mappingErrors = this.wwiseObject.getMappingErrors();

        // no errors
        if( mappingErrors.length == 0 )
            return true;

        // errors
        $(this.htmlElement).find("#mappingErrorsList").empty();
        for( let i=0; i < mappingErrors.length; i++ )
        {
            let curError = mappingErrors[i];
            let newElement = $("#template_mappingError_" + curError.name).contents().clone();
            for( let property in curError )
                newElement.find("."+property).text( curError[ property ] );
            $(this.htmlElement).find("#mappingErrorsList").append(newElement);
        }

        this.mappingErrorsView.show();

        return false;
    }

    onBtnCommitClicked(e)
    {
        this.wwiseObject.commit();
        this.commitButton.disable();
    }
}
