(function(window) {

    // Dependencies
    var Popcorn = window.Popcorn;
    var $ = window.jQuery;

    var ecMap = window.ecMap || {};
    window.ecMap = ecMap;

    // ecMap Popcorn.js scheduler
    // Allows for tying electoral map change events to a Popcorn instance.
    // Arguments:
    // - pop <Popcorn instance>: The Popcorn instance for which events should
    //   be scheduled
    // - options <object>: Specifies scheduling/playback details:
    //   - replayData <object>: An array describing a set of map change events.
    //     Specifying this value will cancel previously-set change events.
    //     Each element should be formatted as follows:
    //     {
    //       timeStamp <number>: UNIX timestamp for the event to occur, relative
    //                           to the beginning of the Popcorn instance's
    //                           timeline
    //       mapState <object>:  Describes the desired state of the map
    //     }
    //   - element <string>: A CSS selector string describing an element on the
    //     page from which to derive the replayDataa by parsing its contents as
    //     JSON.
    //     Specifying this value will cancel previously-set change events.
    //   - ignore <boolean>: A flag to control whether or not change events
    //     should effect the map. Although pausing the Popcorn instance would
    //     acheive a similar result, this is useful for allowing the user to
    //     interact with the map without effecting playback.
    ecMap.popcorn = function(pop, options) {

        var replayData;

        // Ensure that this instance has a namespace in its data object for the
        // plugin
        if (!pop.data.ecMap) {
            pop.data.ecMap = {};
        }

        // Ensure that this instance has an array to track cues
        if (!pop.data.ecMap.cueIDs) {
            pop.data.ecMap.cueIDs = [];
        }

        if ("replayData" in options) {
            replayData = options.replayData;
        } else if ("element" in options) {
            replayData = $.parseJSON($(options.element).text());
        }

        if (replayData) {

            // Cancel any previously-created cues
            Popcorn.forEach(pop.data.ecMap.cueIDs, function(cueID) {

                pop.cue(cueID, -1);

            });
            pop.data.ecMap.cueIDs.length = 0;

            Popcorn.forEach(replayData, function(data, idx) {

                var cueID = "ecMapCue" + idx;

                pop.data.ecMap.cueIDs.push(cueID);

                pop.cue(cueID, data.timeStamp/1000);
                pop.cue(cueID, function() {
                    pop.emit("changeVotes", data.mapState);
                });
            });
        }

        // Allow cues to be ignored so that the playback may be "silenced"
        // without effecting timing
        if (options.ignore) {
            pop.off("changeVotes");
        } else {
            pop.on("changeVotes", function(mapState) {
                ecMap.status.set(mapState);
            });
        }

    };

}(this));