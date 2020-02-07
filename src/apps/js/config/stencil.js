/*! Rappid v2.1.0 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2015 client IO

 2017-04-24 


This Source Code Form is subject to the terms of the Rappid Trial License
, v. 2.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_v2.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var App = App || {};
App.config = App.config || {};

(function() {

    'use strict';

    App.config.stencil = {};

    App.config.stencil.groups = {
        basic: { index: 1, label: '', width:'0px',id:"basic" },
        bpmn: { index: 2, label: 'bpmn', width:'0px',id:"bpm"  }
        /* fsa: { index: 2, label: 'State machine' }, */
        /* pn: { index: 3, label: 'Petri nets' }, */
        /* erd: { index: 4, label: 'Entity-relationship' }, */
        /* uml: { index: 5, label: 'UML' }, */
        /* org: { index: 6, label: 'ORG' } */
    };

    App.config.stencil.shapes = {};

    App.config.stencil.shapes.basic = [
       /*  {
            type: 'basic.Rect',
            size: { width: 2, height: 1 },
            attrs: {
                '.': {
                    'data-tooltip': 'Rectangle',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                rect: {
                    rx: 2,
                    ry: 2,
                    width: 20,
                    height: 10,
                    fill: 'transparent',
                    stroke: '#31d0c6',
                    'stroke-width': 2,
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'rect',
                    fill: '#c6c7e2',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11,
                    'stroke-width': 0
                }
            }
        }, */
       /*  {
            type: 'basic.Circle',
            size: { width: 2, height: 1 },
            attrs: {
                '.': {
                    'data-tooltip': 'Ellipse',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                circle: {
                    width: 20,
                    height: 10,
                    fill: 'transparent',
                    stroke: '#31d0c6',
                    'stroke-width': 2,
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'ellipse',
                    fill: '#c6c7e2',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11,
                    'stroke-width': 0
                }
            }
        }, */

        /* {
            type: 'app.CircularModel',
            size: { width: 2, height: 1 },
            inPorts: ['in1', 'in2'],
            outPorts: ['out'],
            allowOrthogonalResize: false,
            attrs: {
                '.': {
                    'data-tooltip': 'Ellipse with ports',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.body': {
                    fill: 'transparent',
                    stroke: '#31d0c6',
                    'stroke-width': 2,
                    'stroke-dasharray': '0',
                    'rx': '50%',
                    'ry': '50%'
                },
                '.label': {
                    text: 'ellipse',
                    fill: '#c6c7e2',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11,
                    'stroke-width': 0,
                    'ref-y': 0.5,
                    'y-alignment': 'middle'
                }
            }
        }, */
        /* {
            type: 'basic.Image',
            size: { width: 23, height: 22 },
            attrs: {
                '.': {
                    'data-tooltip': 'Image',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                image: {
                    width: 43,
                    height: 32,
                    'xlink:href': 'assets/image-icon1.svg'
                },
                text: {
                    text: 'image',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 9,
                    display: '',
                    stroke: '#000',
                    'stroke-width': 0,
                    'fill': '#222138'
                }
            }
        }, */
		 {
            type: 'fsa.StartState',
            size: { width: 20, height: 20 },
            preserveAspectRatio: true,
            attrs: {
                '.': {
                    'data-tooltip': 'Start State',
                    'data-tooltip-position': 'bottom',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                circle: {                  
                    fill: '#61549C',
                    'stroke-width': 0
                },
                text: {
                    text: 'startState',
                    fill: '#c6c7e2',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11,
                    'stroke-width': 0
                }
            }
        }, 
        {
            type: 'fsa.EndState',
            size: { width: 20, height: 20 },            
            preserveAspectRatio: true,
            attrs: {
                '.': {
                    'data-tooltip': 'End State',
                    'data-tooltip-position': 'bottom',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.inner': {
                    fill: '#6a6c8a',
                    stroke: 'transparent'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#61549C',
                    'stroke-width': 2,
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'endState',
                    fill: '#c6c7e2',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11,
                    'stroke-width': 0
                }
            }
        },
       /* {
            type: 'fsa.State',
            preserveAspectRatio: true,
            attrs: {
                '.': {
                    'data-tooltip': 'State',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                circle: {
                    fill: '#6a6c8a',
                    stroke: 'transparent',
                    'stroke-width': 2,
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'state',
                    fill: '#c6c7e2',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11,
                    'stroke-width': 0
                }
            }
        },*/        
		{
            type: 'erd.Entity',
            size: { width: 40, height: 20 },            
            attrs: {
                '.': {
                    'data-tooltip': 'Activity',
                    'data-tooltip-position': 'bottom',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    rx: 3,
                    ry: 3,
                    fill: '#31d0c6',
                    'stroke-width': 2,
                    stroke: 'transparent',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: '',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        /* {
            type: 'erd.WeakEntity',
            attrs: {
                '.': {
                    'data-tooltip': 'Weak Entity',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#feb663',
                    'stroke-width': 2,
                    points: '100,0 100,60 0,60 0,0',
                    'stroke-dasharray': '0'
                },
                '.inner': {
                    fill: '#feb663',
                    stroke: 'transparent',
                    points: '97,5 97,55 3,55 3,5',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'Weak entity',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        }, */
        {
            type: 'erd.Relationship',
            size: { width: 40, height: 20 },    
            attrs: {
                '.': {
                    'data-tooltip': 'Decision',
                    'data-tooltip-position': 'bottom',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    fill: '#61549C',
                    stroke: 'transparent',
                    'stroke-width': 2,
                    'stroke-dasharray': '0'
                },
                text: {
                    text: '',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'app.RectangularModel',
            size: { width: 40, height: 20 },    
            ports: {
                "groups": {
                    "in": {
                        "markup": "<circle class=\"port-body\" r=\"4\"/>",
                        "attrs": {
                            ".port-body": {
                                "fill": "#b75d32",
                                "stroke-width": 0,
                                "stroke": "#000",
                                "r": 4,
                                "magnet": true
                            },
                            ".port-label": {
                                "font-size": 11,
                                "fill": "#61549C",
                                "font-weight": 800
                            }
                        },
                        "label": {
                            "position": {
                                "name": "top",
                                "args": {
                                    "y": -12
                                }
                            }
                        },
                        "position": {
                            "name": "top"
                        }
                    },
                    "out": {
                        "markup": "<circle class=\"port-body\" r=\"4\"/>",
                        "attrs": {
                            ".port-body": {
                                "fill": "#b75d32",
                                "stroke-width": 0,
                                "stroke": "#000",
                                "r": 4,
                                "magnet": true
                            },
                            ".port-label": {
                                "font-size": 11,
                                "fill": "#61549C",
                                "font-weight": 800
                            }
                        },
                        "label": {
                            "position": {
                                "name": "bottom",
                                "args": {
                                    "y": 12
                                }
                            }
                        },
                        "position": {
                            "name": "bottom"
                        }
                    }
                },
                "items": [{
                    "id": "in1",
                    "group": "in",
                    "attrs": {
                        ".port-label": {
                            "text": "in1"
                        }
                    }
                },
                {
                    "id": "in2",
                    "group": "in",
                    "attrs": {
                        ".port-label": {
                            "text": "in2"
                        }
                    }
                },
                {
                    "id": "out",
                    "group": "out",
                    "attrs": {
                        ".port-label": {
                            "text": "out"
                        }
                    }
                }]
            },
            inPorts: ["in1",
            "in2"],
            outPorts: ["out"],
            allowOrthogonalResize: false,
            attrs: {
                ".": {
                    "data-tooltip": "Join Node",
                    "data-tooltip-position": "bottom",
                    "data-tooltip-position-selector": ".joint-stencil"
                },
                ".label": {
                    "text": "",
                    "ref-y": 0.5,
                    "font-size": 11,
                    "fill": "#f6f6f6",
                    "font-family": "Roboto Condensed",
                    "font-weight": "Normal",
                    "stroke-width": 0,
                    "y-alignment": "middle"
                },
                ".body": {
                    "stroke": "#feb663",
                    "fill": "#feb663",
                    "rx": 2,
                    "ry": 2,
                    "stroke-width": 2,
                    "stroke-dasharray": "0"
                }
            }
        },
        {
            type: 'app.RectangularModel', 
            size: { width: 40, height: 20 },    
            ports: {
                "groups": {
                    "in": {
                        "markup": "<circle class=\"port-body\" r=\"4\"/>",
                        "attrs": {
                            ".port-body": {
                                "fill": "#61549C",
                                "stroke-width": 0,
                                "stroke": "#000",
                                "r": 4,
                                "magnet": true
                            },
                            ".port-label": {
                                "font-size": 11,
                                "fill": "#61549C",
                                "font-weight": 800
                            }
                        },
                        "label": {
                            "position": {
                                "name": "top",
                                "args": {
                                    "y": -12
                                }
                            }
                        },
                        "position": {
                            "name": "top"
                        }
                    },
                    "out": {
                        "markup": "<circle class=\"port-body\" r=\"4\"/>",
                        "attrs": {
                            ".port-body": {
                                "fill": "#61549C",
                                "stroke-width": 0,
                                "stroke": "#000",
                                "r": 4,
                                "magnet": true
                            },
                            ".port-label": {
                                "font-size": 11,
                                "fill": "#61549C",
                                "font-weight": 800
                            }
                        },
                        "label": {
                            "position": {
                                "name": "bottom",
                                "args": {
                                    "y": 12
                                }
                            }
                        },
                        "position": {
                            "name": "bottom"
                        }
                    }
                },
                "items": [{
                    "id": "in",
                    "group": "in",
                    "attrs": {
                        ".port-label": {
                            "text": "in"
                        }
                    }
                },
                {
                    "id": "out1",
                    "group": "out",
                    "attrs": {
                        ".port-label": {
                            "text": "out1"
                        }
                    }
                },
                {
                    "id": "out2",
                    "group": "out",
                    "attrs": {
                        ".port-label": {
                            "text": "out2"
                        }
                    }
                }]
            },           
            inPorts: ['in'],
            outPorts: ['out1','out2'],
            allowOrthogonalResize: false,
            attrs: {
                ".": {
                    "data-tooltip": "Fork Node",
                    "data-tooltip-position": "bottom",
                    "data-tooltip-position-selector": ".joint-stencil"
                },
                ".label": {
                    "text": "",
                    "ref-y": 0.5,
                    "font-size": 11,
                    "fill": "#f6f6f6",
                    "font-family": "Roboto Condensed",
                    "font-weight": "Normal",
                    "stroke-width": 0,
                    "y-alignment": "middle"
                },
                ".body": {
                    "stroke": "#7c68fc",
                    "fill": "#7c68fc",
                    "rx": 2,
                    "ry": 2,
                    "stroke-width": 0,
                    "stroke-dasharray": "0"
                }
            }
        },
        {
            type: 'basic.Path',
            size: { width: 40, height: 20 },
            name: 'SendSignal',
            attrs: {
                '.': {
                    'data-tooltip': 'Send Signal',
                    'data-tooltip-position': 'bottom',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                text: { text: '', 'ref-y': 0.5, 'y-alignment': 'middle', 'ref-dy': null, 'fill': '#f6f6f6',"font-size": 11,"font-family": "Roboto Condensed","font-weight": "Normal","stroke-width": 0 },
                path: { d: 'M 0 0 L 80 0 100 20 80 40 0 40 Z', "stroke": "#03c1c4", "fill": "#03c1c4" }
            }
        },
        {
            type: 'basic.Path',
            size: { width: 40, height: 20 },
            name: 'AcceptEvent',
            attrs: {
                '.': {
                    'data-tooltip': 'Accept Event',
                    'data-tooltip-position': 'bottom',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                text: { text: '', 'ref-y': 0.5, 'y-alignment': 'middle', 'ref-dy': null, 'fill': '#f6f6f6',"font-size": 11,"font-family": "Roboto Condensed","font-weight": "Normal","stroke-width": 0 },
                path: { d: 'M 0 0 L 100 0 100 40 0 40 20 20 Z', "stroke": "#feb663", "fill": "#fe854f", },
            }
        },
        {
            type: 'fsa.State',
            size: { width: 20, height: 20 },    
            preserveAspectRatio: true,
            attrs: {
                '.': {
                    'data-tooltip': 'Exception',
                    'data-tooltip-position': 'bottom',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                circle: {
                    fill: '#FF0000',
                    stroke: 'transparent',
                    'stroke-width': 2,
                    'stroke-dasharray': '0'
                },
                text: {
                    text: '',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11,
                    'stroke-width': 0
                }
            }
        }
        /* {
            type: 'erd.IdentifyingRelationship',
            attrs: {
                '.': {
                    'data-tooltip': 'Identifying Relationship',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#6a6c8a',
                    'stroke-dasharray': '0'
                },
                '.inner': {
                    fill: '#6a6c8a',
                    stroke: 'transparent',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'Relation',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        }, */
        /* {
            type: 'erd.ISA',
            attrs: {
                '.': {
                    'data-tooltip': 'ISA',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                text: {
                    text: 'ISA',
                    fill: '#f6f6f6',
                    'letter-spacing': 0,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11
                },
                polygon: {
                    fill: '#feb663',
                    stroke: 'transparent',
                    'stroke-dasharray': '0'
                }
            }
        }, */
        /* {
            type: 'erd.Key',
            attrs: {
                '.': {
                    'data-tooltip': 'Key',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#fe854f',
                    'stroke-dasharray': '0'
                },
                '.inner': {
                    fill: '#fe854f',
                    stroke: 'transparent',
                    display: 'block',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'Key',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        }, */
        /*{
            type: 'erd.Normal',
            attrs: {
                '.': {
                    'data-tooltip': 'Normal',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    fill: '#feb663',
                    stroke: 'transparent',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'Normal',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        }*/
        /* {
            type: 'erd.Multivalued',
            attrs: {
                '.': {
                    'data-tooltip': 'Mutltivalued',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#fe854f',
                    'stroke-dasharray': '0'
                },
                '.inner': {
                    fill: '#fe854f',
                    stroke: 'transparent',
                    rx: 43,
                    ry: 21,
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'MultiValued',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        }, */
        /* {
            type: 'erd.Derived',
            attrs: {
                '.': {
                    'data-tooltip': 'Derived',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#fe854f',
                    'stroke-dasharray': '0'
                },
                '.inner': {
                    fill: '#feb663',
                    stroke: 'transparent',
                    'display': 'block',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'Derived',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11,
                    'stroke-width': 0
                }
            }
        } */
    ];

    App.config.stencil.shapes.bpmn = [
        {
            type: "bpmn.Gateway",
            size: {
                width: 20,
                height: 20
            },
            attrs: {
                '.': {
                    'data-tooltip': 'Gateway',
                    'data-tooltip-position': 'bottom',
                },
                ".body": {
                    points: "40,0 80,40 40,80 0,40",
                    fill: '#61549C',
                    stroke: "#000000"
                },
                ".label": {
                    text: "",
                    ref: ".body",
                    "ref-x": .5,
                    "ref-dy": 20,
                    "y-alignment": "middle",
                    "x-alignment": "middle",
                    "font-size": 14,
                    "font-family": "Arial, helvetica, sans-serif",
                    fill: "#000000"
                },
                image: {
                    width: 40,
                    height: 40,
                    "xlink:href": "",
                    transform: "translate(20,20)"
                }
            }
        },
        {
            type: "bpmn.Event",
            size: {
                width: 20,
                height: 20
            },
            attrs: {
                '.': {
                    'data-tooltip': 'Event',
                    'data-tooltip-position': 'bottom',
                },
                ".body": {
                    fill: "#ffffff",
                    stroke: "#000000"
                },
                ".outer": {
                    "stroke-width": 1,
                    r: 30,
                    transform: "translate(30,30)"
                },
                ".inner": {
                    "stroke-width": 1,
                    r: 26,
                    transform: "translate(30,30)"
                },
                image: {
                    width: 40,
                    height: 40,
                    "xlink:href": "",
                    transform: "translate(10,10)"
                },
                ".label": {
                    text: "",
                    fill: "#000000",
                    "font-family": "Arial",
                    "font-size": 14,
                    ref: ".outer",
                    "ref-x": .5,
                    "ref-dy": 20,
                    "x-alignment": "middle",
                    "y-alignment": "middle"
                }
            }    
        },
        {
            type: "bpmn.Activity",
            size: {
                width: 20,
                height: 20
            },
            attrs: {
                rect: {
                    rx: 8,
                    ry: 8,
                    width: 100,                   
                    height: 100
                },
                '.': {
                    'data-tooltip': 'Activity',
                    'data-tooltip-position': 'bottom',
                },
                ".body": {
                    fill: "#ffffff",
                    fill: '#FF0000',
                    stroke: "#000000"
                },
                ".inner": {
                    transform: "scale(0.9,0.9) translate(5,5)"
                },
                path: {
                    d: "M 0 0 L 30 0 30 30 0 30 z M 15 4 L 15 26 M 4 15 L 26 15",
                    ref: ".inner",
                    "ref-x": .5,
                    "ref-dy": -30,
                    "x-alignment": "middle",
                    stroke: "#000000",
                    fill: "transparent"
                },
                image: {
                    ref: ".inner",
                    "ref-x": 5,
                    width: 20,
                    height: 20
                }            
        }       
     },    
    {
        type: "bpmn.DataObject",
        size: {
            width: 30,
            height: 20
        },
        attrs: {
            '.': {
                'data-tooltip': 'DataObject',
                'data-tooltip-position': 'bottom',
            },
            ".body": {
                points: "20,0 60,0 60,80 0,80 0,20 20,0 20,20 0,20",
                stroke: "#000000",
                fill: "#6A6C8A"
            },
            ".label": {
                ref: ".body",
                "ref-x": .5,
                "ref-dy": 5,
                text: "",
                "text-anchor": "middle"
            }
        }
    },
    {
        type: "bpmn.Conversation",
        size: {
            width: 30,
            height: 20
        },
        attrs: {
            '.': {
                'data-tooltip': 'Conversation',
                'data-tooltip-position': 'bottom',
            },
            ".body": {
                points: "25,0 75,0 100,50 75,100 25,100 0,50",
                stroke: "#000000",
                fill: "#FE854F"
            },
            ".label": {
                text: "",
                ref: ".body",
                "ref-x": .5,
                "ref-dy": 5,
                "text-anchor": "middle"
            },
            path: {
                d: "M 0 0 L 30 0 30 30 0 30 z M 15 4 L 15 26 M 4 15 L 26 15",
                ref: ".body",
                "ref-x": .5,
                "ref-dy": -30,
                "x-alignment": "middle",
                fill: "#ffffff",
                stroke: "#000000",
                "fill-opacity": 0
            }
        }
    },
    {
        type: "bpmn.Choreography",
        size: {
            width: 30,
            height: 20
        },
        attrs: {
            rect: {},
            '.': {
                'data-tooltip': 'Choreography',
                'data-tooltip-position': 'bottom',
            },
            ".body": {
                width: 60,
                height: 80,
                stroke: "#000000",
                fill:" #61549C"
            },
            ".label": {
                ref: ".body",
                "ref-x": .5,
                "ref-dy": 5,
                text: "",
                "text-anchor": "middle"
            },
            ".participant-rect": {
                stroke: "#000000",
                fill: "#aaaaaa",
                ref: ".body",
                "ref-width": 1
            },
            ".participant-label": {
                "text-anchor": "middle",
                ref: ".participant_0 .participant-rect",
                "ref-x": .5,
                "ref-y": .5,
                "y-alignment": "middle"
            },
            ".sub-process": {
                d: "M 0 0 L 30 0 30 30 0 30 z M 15 4 L 15 26 M 4 15 L 26 15",
                ref: ".body",
                "ref-x": .5,
                "ref-dy": -30,
                "x-alignment": "middle",
                fill: "transparent",
                stroke: "#000000"
            }
        },
        participants: [],
        initiatingParticipant: 0
    },
    {
        type: "bpmn.Message",
        size: {
            width: 30,
            height: 20
        },
        attrs: {
            '.': {
                'data-tooltip': 'Message',
                'data-tooltip-position': 'bottom',
            },
            ".body": {
                points: "0,0 60,0 60,40 0,40 0,0 60,0 30,20 0,0",
                stroke: "#000000",                
                fill:"#FEB663"             
             },
            ".label": {
                ref: ".body",
                "ref-x": .5,
                "ref-dy": 5,
                text: "",
                "text-anchor": "middle"
            }
        },
        
    },{
        type: "bpmn.Annotation",
        size: {
           width: 30,
           height: 20
       },
           attrs: {
               rect: {
                   width: 100,
                   height: 100
               },
               '.': {
                   'data-tooltip': 'Annotation',
                   'data-tooltip-position': 'bottom',
               },
               ".body": {
                   "fill-opacity": 0.4,
                   fill: "#61549C",
                   stroke: "none"
               },
               ".fobj div": {
                   style: {
                       textAlign: "left",
                       paddingLeft: 10,                        
                   }
               },
               ".stroke": {
                   stroke: "#000000",
                   fill: "#61549C",
                   "stroke-width": 3
               }
           }
   },
   {
       type: "bpmn.Group",
       size: {
           width: 30,
           height: 5
       },
       attrs: {
           '.': {
               'data-tooltip': 'Group',
               'data-tooltip-position': 'bottom',
           },
           ".body": {
               width: 200,
               height: 200,
               stroke: "#000000",
               "stroke-dasharray": "6,6",
               "stroke-width": 2,
               fill: "transparent",
               rx: 15,
               ry: 15,            
               "pointer-events": "stroke"
           },
           ".label-rect": {
               ref: ".body",
               "ref-width": .6,
               "ref-x": .4,
               "ref-y": -9,
               height: 25,
               fill: "#ffffff",
               stroke: "#000000"
           },
           ".label-group": {
               ref: ".label-rect",
               "ref-x": 0,
               "ref-y": 10
           },
           ".label-wrap": {
               ref: ".label-rect",
               "ref-width": 1,
               "ref-height": 1
           },
           ".label": {
               text: "",
               x: "50%",
               y: "1.3em",
               "text-anchor": "middle",
               "font-family": "Arial",
               "font-size": 14,
               fill: "#000000"
           }
       }
   }
    // {
    //     type: "bpmn.Pool",
    //     size: {
    //         width: 20,
    //         height: 20
    //     },
    //     attrs: {
    //         ".body": {
    //             fill: "#ffffff",
    //             stroke: "#000000",
    //             width: 500,
    //             height: 200,
    //             "pointer-events": "stroke"
    //         },
    //         ".header": {
    //             fill: "#ffffff",
    //             stroke: "#000000",
    //             width: 20,
    //             ref: ".body",
    //             "ref-height": 1,
    //             "pointer-events": "visiblePainted"
    //         },
    //         ".label": {
    //             fill: "#000000",
    //             transform: "rotate(-90)",
    //             ref: ".header",
    //             "ref-x": 10,
    //             "ref-y": .5,
    //             "font-family": "Arial",
    //             "font-size": 14,
    //             "x-alignment": "middle",
    //             "text-anchor": "middle"
    //         },
    //         ".lane-body": {
    //             fill: "#ffffff",
    //             stroke: "#000000",
    //             "pointer-events": "stroke"
    //         },
    //         ".lane-header": {
    //             fill: "#ffffff",
    //             stroke: "#000000",
    //             "pointer-events": "visiblePainted"
    //         },
    //         ".lane-label": {
    //             fill: "#000000",
    //             transform: "rotate(-90)",
    //             "text-anchor": "middle",
    //             "font-family": "Arial",
    //             "font-size": 13
    //         },
    //         ".blackbox-wrap": {
    //             ref: ".body",
    //             "ref-width": 1,
    //             "ref-height": 1
    //         },
    //         ".blackbox-label": {
    //             text: "Black Box",
    //             "text-anchor": "middle",
    //             transform: "translate(0,-7)"
    //         },
    //         ".blackbox-label > tspan": {
    //             dx: "50%",
    //             dy: "50%"
    //         }
    //     }   
    // }
    
    ];

    App.config.stencil.shapes.fsa = [
/*
        {
            type: 'fsa.StartState',
            preserveAspectRatio: true,
            attrs: {
                '.': {
                    'data-tooltip': 'Start State',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                circle: {
                    width: 40,
                    height: 20,
                    fill: '#61549C',
                    'stroke-width': 0
                },
                text: {
                    text: 'startState',
                    fill: '#c6c7e2',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11,
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'fsa.EndState',
            preserveAspectRatio: true,
            attrs: {
                '.': {
                    'data-tooltip': 'End State',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.inner': {
                    fill: '#6a6c8a',
                    stroke: 'transparent'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#61549C',
                    'stroke-width': 2,
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'endState',
                    fill: '#c6c7e2',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11,
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'fsa.State',
            preserveAspectRatio: true,
            attrs: {
                '.': {
                    'data-tooltip': 'State',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                circle: {
                    fill: '#6a6c8a',
                    stroke: '#61549C',
                    'stroke-width': 2,
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'state',
                    fill: '#c6c7e2',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11,
                    'stroke-width': 0
                }
            }
        }*/
    ];

    App.config.stencil.shapes.pn = [

        {
            type: 'pn.Place',
            preserveAspectRatio: true,
            tokens: 3,
            attrs: {
                '.': {
                    'data-tooltip': 'Place',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.root': {
                    fill: 'transparent',
                    stroke: '#61549C',
                    'stroke-width': 2,
                    'stroke-dasharray': '0'
                },
                '.tokens circle': {
                    fill: '#6a6c8a',
                    stroke: '#000',
                    'stroke-width': 0
                },
                '.label': {
                    text: '',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal'
                }
            }
        },
        {
            type: 'pn.Transition',
            preserveAspectRatio: true,
            attrs: {
                '.': {
                    'data-tooltip': 'Transition',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                rect: {
                    rx: 3,
                    ry: 3,
                    width: 12,
                    height: 50,
                    fill: '#61549C',
                    stroke: '#7c68fc',
                    'stroke-width': 0,
                    'stroke-dasharray': '0'
                },
                '.label': {
                    text: 'transition',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'stroke-width': 0,
                    'fill': '#222138'
                }
            }
        }
    ];

    App.config.stencil.shapes.erd = [

        {
            type: 'erd.Entity',
            attrs: {
                '.': {
                    'data-tooltip': 'Entity',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    rx: 3,
                    ry: 3,
                    fill: '#31d0c6',
                    'stroke-width': 2,
                    stroke: 'transparent',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'Entity',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'erd.WeakEntity',
            attrs: {
                '.': {
                    'data-tooltip': 'Weak Entity',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#feb663',
                    'stroke-width': 2,
                    points: '100,0 100,60 0,60 0,0',
                    'stroke-dasharray': '0'
                },
                '.inner': {
                    fill: '#feb663',
                    stroke: 'transparent',
                    points: '97,5 97,55 3,55 3,5',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'Weak entity',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'erd.Relationship',
            attrs: {
                '.': {
                    'data-tooltip': 'Relationship',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    fill: '#61549C',
                    stroke: 'transparent',
                    'stroke-width': 2,
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'Relation',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'erd.IdentifyingRelationship',
            attrs: {
                '.': {
                    'data-tooltip': 'Identifying Relationship',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#6a6c8a',
                    'stroke-dasharray': '0'
                },
                '.inner': {
                    fill: '#6a6c8a',
                    stroke: 'transparent',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'Relation',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'erd.ISA',
            attrs: {
                '.': {
                    'data-tooltip': 'ISA',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                text: {
                    text: 'ISA',
                    fill: '#f6f6f6',
                    'letter-spacing': 0,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11
                },
                polygon: {
                    fill: '#feb663',
                    stroke: 'transparent',
                    'stroke-dasharray': '0'
                }
            }
        },
        {
            type: 'erd.Key',
            attrs: {
                '.': {
                    'data-tooltip': 'Key',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#fe854f',
                    'stroke-dasharray': '0'
                },
                '.inner': {
                    fill: '#fe854f',
                    stroke: 'transparent',
                    display: 'block',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'Key',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'erd.Normal',
            attrs: {
                '.': {
                    'data-tooltip': 'Normal',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    fill: '#feb663',
                    stroke: 'transparent',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'Normal',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'erd.Multivalued',
            attrs: {
                '.': {
                    'data-tooltip': 'Mutltivalued',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#fe854f',
                    'stroke-dasharray': '0'
                },
                '.inner': {
                    fill: '#fe854f',
                    stroke: 'transparent',
                    rx: 43,
                    ry: 21,
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'MultiValued',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    fill: '#f6f6f6',
                    'stroke-width': 0
                }
            }
        },
        {
            type: 'erd.Derived',
            attrs: {
                '.': {
                    'data-tooltip': 'Derived',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.outer': {
                    fill: 'transparent',
                    stroke: '#fe854f',
                    'stroke-dasharray': '0'
                },
                '.inner': {
                    fill: '#feb663',
                    stroke: 'transparent',
                    'display': 'block',
                    'stroke-dasharray': '0'
                },
                text: {
                    text: 'Derived',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11,
                    'stroke-width': 0
                }
            }
        }
    ];

    App.config.stencil.shapes.uml = [

        {
            type: 'uml.Class',
            name: 'Class',
            attributes: ['+attr1'],
            methods: ['-setAttr1()'],
            size: {
                width: 150,
                height: 100
            },
            attrs: {
                '.': {
                    'data-tooltip': 'Class',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.uml-class-name-rect': {
                    top: 2,
                    fill: '#61549C',
                    stroke: '#f6f6f6',
                    'stroke-width': 1,
                    rx: 8,
                    ry: 8
                },
                '.uml-class-attrs-rect': {
                    top: 2,
                    fill: '#61549C',
                    stroke: '#f6f6f6',
                    'stroke-width': 1,
                    rx: 8,
                    ry: 8
                },
                '.uml-class-methods-rect': {
                    top: 2,
                    fill: '#61549C',
                    stroke: '#f6f6f6',
                    'stroke-width': 1,
                    rx: 8,
                    ry: 8
                },
                '.uml-class-name-text': {
                    ref: '.uml-class-name-rect',
                    'ref-y': 0.5,
                    'y-alignment': 'middle',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11
                },
                '.uml-class-attrs-text': {
                    ref: '.uml-class-attrs-rect',
                    'ref-y': 0.5,
                    'y-alignment': 'middle',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11
                },
                '.uml-class-methods-text': {
                    ref: '.uml-class-methods-rect',
                    'ref-y': 0.5,
                    'y-alignment': 'middle',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11
                }
            }
        },
        {
            type: 'uml.Interface',
            name: 'Interface',
            attributes: ['+attr1'],
            methods: ['-setAttr1()'],
            size: {
                width: 150,
                height: 100
            },
            attrs: {
                '.': {
                    'data-tooltip': 'Interface',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.uml-class-name-rect': {
                    fill: '#fe854f',
                    stroke: '#f6f6f6',
                    'stroke-width': 1,
                    rx: 8,
                    ry: 8
                },
                '.uml-class-attrs-rect': {
                    fill: '#fe854f',
                    stroke: '#f6f6f6',
                    'stroke-width': 1,
                    rx: 8,
                    ry: 8
                },
                '.uml-class-methods-rect': {
                    fill: '#fe854f',
                    stroke: '#f6f6f6',
                    'stroke-width': 1,
                    rx: 8,
                    ry: 8
                },
                '.uml-class-name-text': {
                    ref: '.uml-class-name-rect',
                    'ref-y': 0.5,
                    'y-alignment': 'middle',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11
                },
                '.uml-class-attrs-text': {
                    ref: '.uml-class-attrs-rect',
                    'ref-y': 0.5,
                    'y-alignment': 'middle',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-size': 11
                },
                '.uml-class-methods-text': {
                    ref: '.uml-class-methods-rect',
                    'ref-y': 0.5,
                    'y-alignment': 'middle',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11
                }
            }
        },
        {
            type: 'uml.Abstract',
            name: 'Abstract',
            attributes: ['+attr1'],
            methods: ['-setAttr1()'],
            size: {
                width: 150,
                height: 100
            },
            attrs: {
                '.': {
                    'data-tooltip': 'Abstract',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.uml-class-name-rect': {
                    fill: '#6a6c8a',
                    stroke: '#f6f6f6',
                    'stroke-width': 1,
                    rx: 8,
                    ry: 8
                },
                '.uml-class-attrs-rect': {
                    fill: '#6a6c8a',
                    stroke: '#f6f6f6',
                    'stroke-width': 1,
                    rx: 8,
                    ry: 8
                },
                '.uml-class-methods-rect': {
                    fill: '#6a6c8a',
                    stroke: '#f6f6f6',
                    'stroke-width': 1,
                    rx: 8,
                    ry: 8
                },
                '.uml-class-name-text': {
                    ref: '.uml-class-name-rect',
                    'ref-y': 0.5,
                    'y-alignment': 'middle',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11
                },
                '.uml-class-attrs-text': {
                    ref: '.uml-class-attrs-rect',
                    'ref-y': 0.5,
                    'y-alignment': 'middle',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11
                },
                '.uml-class-methods-text': {
                    ref: '.uml-class-methods-rect',
                    'ref-y': 0.5,
                    'y-alignment': 'middle',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 11
                }
            }
        },

        {
            type: 'uml.State',
            name: 'State',
            events: ['entry/', 'create()'],
            size: {
                width: 150,
                height: 100
            },
            attrs: {
                '.': {
                    'data-tooltip': 'State',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.uml-state-body': {
                    fill: '#feb663',
                    stroke: '#f6f6f6',
                    'stroke-width': 1,
                    rx: 8,
                    ry: 8,
                    'stroke-dasharray': '0'
                },
                '.uml-state-separator': {
                    stroke: '#f6f6f6',
                    'stroke-width': 1,
                    'stroke-dasharray': '0'
                },
                '.uml-state-name': {
                    fill: '#f6f6f6',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal'
                },
                '.uml-state-events': {
                    fill: '#f6f6f6',
                    'font-size': 11,
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal'
                }
            }
        }
    ];

    App.config.stencil.shapes.org = [

        {
            type: 'org.Member',
            attrs: {
                '.': {
                    'data-tooltip': 'Member',
                    'data-tooltip-position': 'left',
                    'data-tooltip-position-selector': '.joint-stencil'
                },
                '.rank': {
                    text: 'Rank',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-size': 12,
                    'font-weight': 'Bold',
                    'text-decoration': 'none'
                },
                '.name': {
                    text: 'Person',
                    fill: '#f6f6f6',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 10
                },
                '.card': {
                    fill: '#31d0c6',
                    stroke: 'transparent',
                    'stroke-width': 0,
                    'stroke-dasharray': '0'
                },
                image: {
                    width: 32,
                    height: 32,
                    x: 16,
                    y: 13,
                    ref: null,
                    'ref-x': null,
                    'ref-y': null,
                    'y-alignment': null,
                    'xlink:href': 'assets/member-male.png'
                }
            }
        }
    ];

})();
