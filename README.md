# Waapitools

A collection of Javascript based tools for Wwise, using WAAPI from your browser.
Download, unzip anywhere and open index.html to use.

## 1. Event Soundbank finder

This tool is used to find out in which soundbank(s) a wwise event is included, upon selection of the event in the Wwise Authoring Tool, regardless of whether the event is directly included in a bank or through the inclusion of one of its parent folders or WWU. This is designed to work around the issue of Wwise's Reference View ignoring indirect references (a soundbank appears in an event's references only if the event is directly included in the bank).

## 2. Batch Attenuations Editor

The Batch Attenuations Editor is designed to help with the creation and update of large attenuation sets, by interpolating attenuation curves between a short (eg 1m) and a long (eg 100m) attenuation.

![screenshot](https://user-images.githubusercontent.com/5003391/43848905-5033ffe0-9b34-11e8-8fb6-adfc5197da1f.png)

## 3. Sampler Keymapper

The Sampler Keymapper automatically sets **MIDI root key** and **key range** parameters on children of a blend container if their names contain a note name (eg MyPianoSample_C#3 is mapped to MIDI root key 49 and its range is set based on neighbouring samples root notes).

![waapitools_keymapper](https://user-images.githubusercontent.com/5003391/52117367-d3228600-2613-11e9-87b1-a3d4137f92fb.png)

## 4. Notes Review

Notes Review provides a comprehensive display of all notes in the Wwise project.

## 5. Renamer

The Renamer allows for easy search/replace in names of objects in the Actor-Mixer Hierarchy. In addition to the selected Actor-Mixer hierarchy object, it will apply the same renaming to:
- all its children
- all the events referencing it

## 6. Creator

The Creator helps with the batch creation of children to the currently selected object, from an object type, a list of names and a common prefix.
