# Waapitools

A collection of Javascript based tools for Wwise, using WAAPI from your browser.
Download, unzip anywhere and open index.html to use. Alternatively available on https://waapitools.org for direct use.

## 1. Event Soundbank finder

This tool is used to find out in which soundbank(s) a wwise event is included, upon selection of the event in the Wwise Authoring Tool, regardless of whether the event is directly included in a bank or through the inclusion of one of its parent folders or WWU. This is designed to work around the issue of Wwise's Reference View ignoring indirect references (a soundbank appears in an event's references only if the event is directly included in the bank).

**Usage:** select an event in Wwise.

## 2. Batch Attenuations Editor

The Batch Attenuations Editor is designed to help with the creation and update of large attenuation sets, by interpolating attenuation curves between a short (eg 1m) and a long (eg 100m) attenuation.

![attenuations](https://github.com/user-attachments/assets/532c6e59-70c4-4947-a41f-a7c4ce762aff)

**Usage:**
* Create an attenuations folder or work unit
* Inside, create 2 attenuations with names ending with their max radius (e.g. 1m, 100m)
* Edit the attenuations curves, making sure each curve has a matching number of points between the short/long attenuation
* Select the parent folder
* In Waapitools, choose how many intermediate attenuations you want to create by setting distance intervals
* For each curve (volume, aux sends...) and each point, choose how the point's coordinates will be interpolated from the shortest to the longest attenuation (linear, quadratic, etc.)
* Commit the new interpolated attenuations to Wwise

## 3. Sampler Keymapper

The Sampler Keymapper automatically sets **MIDI root key** and **key range** parameters on children of a blend container if their names contain a note name (eg MyPianoSample_C#3 is mapped to MIDI root key 49 and its range is set based on neighbouring samples root notes).

![keymapper](https://github.com/user-attachments/assets/309c9d8b-6442-46c1-96ef-127f282f5796)

**Usage:**
* Create a blend container
* Inside, create the sound objects representing your sampler notes 
    * Each sound object name must end with a note name (e.g. C#3, G7, Eb2...)
* Select the blend container
* From Waapitools, commit the note's MIDI roots and key ranges to Wwise

## 4. Notes Review

Notes Review provides a comprehensive display of all notes in the Wwise project. It's brutally stupid and _will_ freeze on huge projects.

## 5. Renamer

The Renamer allows for easy search/replace in names of objects in the Actor-Mixer Hierarchy. In addition to the selected Actor-Mixer hierarchy object, it will apply the same renaming to:
- all its children
- all the events referencing it

![image](https://github.com/user-attachments/assets/033f2422-3a67-4d12-9179-e972c34d2096)

**Usage:**
* Select an object in the actor-mixer hierarchy
* Edit the search and replace strings
* Check the changes and commit them to Wwise

## 6. Creator

The Creator helps with the batch creation of children to the currently selected object, from an object type, a list of names and a common prefix.

![creator](https://github.com/user-attachments/assets/87c3c356-41c5-43ee-a766-2cdc566bfcf8)

**Usage:**
* Select an parent object in your Wwise project
* Choose an object type to create
* Fill in the list of the names you want to give your new objects
* Optionnally, choose a common prefix for all your new objects
* Check the pending objects list
* Commit the new objects to Wwise

## 7. Nester

The Nester can 'nest' selected objects in new parents of your chosen type. The new parents will be nalmed after their children. 

A typical use case would be to create random containers from a list of freshly imported sounds, each set of similarly named sounds getting their own parent.

![nester](https://github.com/user-attachments/assets/61d965c9-3543-4453-a2f7-af5208d95a6b)

**Usage:**
* Select multiple objects in your Wwise project
* Check the tool groups them as desired, based on their names
* Choose the type of object you want to create as their new parents
* Commit the new parents to Wwise