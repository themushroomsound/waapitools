// App model
class AppModel extends GenericModel
{
    constructor()
    {
        console.log("Building Waapitools App Model");

        super();

        this.projectName = "";
        this.selectedObjects = undefined;
        this.connectionClosedReason = "";
        this.connectionClosedDetails = "";
        this.wwiseLocked = false;

        this.session = undefined;
        this.connection = new autobahn.Connection({
            url: 'ws://localhost:8080/waapi',
            realm: 'realm1',
            protocols: ['wamp.2.json'],
            retry_if_unreachable: false
        });

        var self = this;
        this.connection.onclose = function(reason, details) { self.onConnectionClose(reason, details); }
        this.connection.onopen = function(session) { self.onConnectionOpen(session); }
        this.connection.open();
    }

    disconnect()
    {
        if(this.session)
            this.connection.close();
    }

    onConnectionOpen(session)
    {
        console.log('WAMP connection opened');
        var self = this;
        this.session = session;

        return self.getProjectName().then(function(projectName) {
            self.projectName = projectName;
        }).then(function() {
            return self.subscribeSelectionChanged(function(args, kwargs, details) {
                self.onSelectionChanged(kwargs["objects"]);
            });
        }).then(function() {
            return self.querySelectedObjects().then(function(res) {
                self.onSelectionChanged(res);
            });
        });
    }

    onConnectionClose(reason, details)
    {
        console.log('WAMP connection closed', reason, details);
        this.connectionClosedReason = reason;
        this.connectionClosedDetails = details;
        this.session = undefined;
        this.refreshViews();
        return true;
    }    

    onCallError(error, query = {})
    {
        console.error("Call error");
        console.log("query:", query);
        console.log("error:", error);
        if(error.error == "ak.wwise.locked") {
            this.wwiseLocked = true;
            this.refreshViews();
        }
    }

    onSelectionChanged(selectedObjects)
    {
        this.selectedObjects = selectedObjects
        console.log("Selected objects changed to", this.selectedObjects);
        this.refreshViews();
    }

    query(uri, query = {}, options = {})
    {
        var self = this;

        // call query
        return this.session.call(uri, [], query, options).then(
            function(res) { return res; },
            function(error) {
                self.onCallError(error, query);
                return Promise.reject(error);
            }
        );
    }

    queryObjects(query, options = {})
    {
        // minimum fields to return
        var minReturnFields = ['id', 'name', 'type', 'path', 'category', 'notes']
        if(options == {} || options.return == undefined || options.return.length < 1)
            options.return = minReturnFields;
        else for( let i=0; i < minReturnFields.length; i++ )
            if( options.return.indexOf( minReturnFields[i] ) < 0 )
                options.return.push( minReturnFields[i] );

        return this.query(ak.wwise.core.object.get, query, options);
    }

    queryFamily(guid, selectType)
    {
        var query = {
            from:{id:[guid]},
            transform:[{select:[selectType]}]
        };
        return this.queryObjects(query)
    }

    querySelectedObjects()
    {
        var query = {};
        var options = {
            return: ['id', 'name', 'type', 'category', 'path', 'parent']
        };
        return this.query(ak.wwise.ui.getSelectedObjects, query, options).then(function(res) {
            return res.kwargs.objects;
        });
    }

    queryObjectTypes()
    {
        var query = {};
        return this.query(ak.wwise.core.object.getTypes, query);
    }

    getActorMixerHierarchy()
    {
        var query = {
            from:{path:['\\Actor-Mixer Hierarchy']},
            transform:[
                {select:['descendants']}
            ]
        };
        var options = {
            return: ['id', 'name', 'type', 'path', 'parent']
        };
        return this.queryObjects(query, options);
    }

    getProjectName()
    {
        var query = {
            from:{ofType:['Project']},
        };
        return this.queryObjects(query).then(function(res) {
            return res.kwargs.return[0].name;
        });
    }

    findInProjectExplorer(path)
    {
        var query = {
            "command": "FindInProjectExplorerSyncGroup1",
            "objects": [ path ]
        };
        return this.query(ak.wwise.ui.commands.execute, query);
    }

    subscribeSelectionChanged(callback)
    {
        var options = {
            return: ['id', 'name', 'type', 'category', 'path', 'parent']
        };
        this.session.subscribe(ak.wwise.ui.selectionChanged, callback, options).then(
            function(subscription) {
                console.log("Successfully subscribed to selection change");
                console.log(subscription);
            },
            function(error) {
                console.error("Failed subscribing to selection change");
                console.error(error);
            }
        );
    }

    moveObject(object_guid, parent_guid)
    {
        var query = {
            "object": object_guid,
            "parent": parent_guid
        };
        return this.query(ak.wwise.core.object.move, query);
    }
}