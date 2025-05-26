class CreatorView extends WwiseObjectView
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
        this.prefixInput = $(this.htmlElement).find("#prefix");
        this.namesInput = $(this.htmlElement).find("#names");

        // commit button
        this.commitButton = new GenericButton($(this.htmlElement).find("#btn_commit"));

        let self = this;
        this.commitButton.setClick(function(e) {
            self.onBtnCommitClicked(e);
            return false;
        });

        this.typeInput.on('input', function() { self.onInputChange(); });
        this.prefixInput.on('input', function() { self.onInputChange(); });
        this.namesInput.on('input', function() { self.onInputChange(); });

        this.refresh();
    }

    setObject(object)
    {
        super.setObject(object);
        this.onInputChange();
    }

    onBtnCommitClicked(e)
    {
        this.wwiseObject.commitChildren();
        this.commitButton.disable();
    }

    onInputChange()
    {
        let typeStr = this.typeInput.val();
        let prefixStr = this.prefixInput.val().trim();
        let namesStr = this.namesInput.val().trim();

        let names = namesStr.split('\n');
        this.wwiseObject.createNewChildren(typeStr, prefixStr, names);
        this.populatePendingChildren();
    }

    // populate possible child object type
    populateTypeSelectInput(category = undefined)
    {
        let possibleTypes = category ? wwiseObjectTypesByCategory[category] : wwiseObjectTypes;

        this.typeInput.empty();
        for (var i = 0; i < possibleTypes.length; i++) {
            this.typeInput.append('<option value="' + possibleTypes[i] + '">' + possibleTypes[i] + '</option>');
        }
    }

    // populate pending children
    populatePendingChildren()
    {
        var children = this.wwiseObject.childrenObjects;
        this.childrenTable.html("");
        for(let index in children ) {
            var newRow = $("#template_pendingChildObjectRow").contents().clone();
            var newChildObjectView = new WwiseObjectView(newRow);
            newChildObjectView.setWwiseObject(children[index]);
            newRow.appendTo(this.childrenTable);
        }
        this.commitButton.enable();
    }

    reset()
    {
        super.reset();
        this.commitButton.disable();
    }    

    populate()
    {
        super.populate();

        this.populateTypeSelectInput(this.wwiseObject.category);
        this.populatePendingChildren();

        this.commitButton.enable();
    }
}
