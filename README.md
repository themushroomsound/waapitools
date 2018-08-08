# Waapitools

A collection of Javascript based tools for Wwise, using WAAPI

![screenshot](https://user-images.githubusercontent.com/5003391/43848905-5033ffe0-9b34-11e8-8fb6-adfc5197da1f.png)

## 1. Event Soundbank finder

This tool is used to find out in which soundbank(s) a wwise event is included, upon selection of the event in the Wwise Authoring Tool, regardless of whether the event is directly included in a bank or through the inclusion of one of its parent folders or WWU. This is designed to work around the issue of Wwise's Reference View ignoring indirect references (a soundbank appears in an event's references only if the event is directly included in the bank).

## 2. Batch Attenuations Editor

The Batch Attenuations Editor is designed to help with the creation and update of large attenuation sets, by interpolating attenuation curves between a short (eg 1m) and a long (eg 100m) attenuation.
