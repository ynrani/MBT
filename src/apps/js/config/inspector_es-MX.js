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

    var options = {

        colorPalette: [
            { content: 'transparent', icon: 'assets/transparent-icon.png' },
            { content: '#f6f6f6' },
            { content: '#dcd7d7' },
            { content: '#8f8f8f' },
            { content: '#c6c7e2' },
            { content: '#feb663' },
            { content: '#fe854f' },
            { content: '#b75d32' },
            { content: '#31d0c6' },
            { content: '#7c68fc' },
            { content: '#61549C' },
            { content: '#6a6c8a' },
            { content: '#4b4a67' },
            { content: '#3c4260' },
            { content: '#33334e' },
            { content: '#222138' }
        ],

        fontWeight: [
            { value: '300', content: '<span style="font-weight: 300">Claro</span>' },
            { value: 'Normal', content: '<span style="font-weight: Normal">Normal</span>' },
            { value: 'Bold', content: '<span style="font-weight: Bolder">Negrita</span>' }
        ],

        fontFamily: [
            { value: 'Alegreya Sans', content: '<span style="font-family: Alegreya Sans">Alegreya Sans</span>' },
            { value: 'Averia Libre', content: '<span style="font-family: Averia Libre">Averia Libre</span>' },
            { value: 'Roboto Condensed', content: '<span style="font-family: Roboto Condensed">Roboto Condensed</span>' }
        ],

        strokeStyle: [
            { value: '0', content: 'Sólido' },
            { value: '2,5', content: 'Punteado' },
            { value: '10,5', content: 'Guión' }
        ],

        side: [
            { value: 'top', content: 'Lado superior' },
            { value: 'right', content: 'Lado derecho' },
            { value: 'bottom', content: 'Lado inferior' },
            { value: 'left', content: 'Lado izquierdo' }
        ],

        portLabelPositionRectangle: [
            { value: { name: 'top', args: { y: -12 }}, content: 'Encima' },
            { value: { name: 'right', args: { y: 0 }}, content: 'A la derecha' },
            { value: { name: 'bottom', args: { y: 12 }}, content: 'Abajo' },
            { value: { name: 'left', args: { y: 0 }}, content: 'A la izquierda' }
        ],

        portLabelPositionEllipse: [
            { value: 'radial' , content: 'Horizontal' },
            { value: 'radialOriented' , content: 'Angular' }
        ],

        imageIcons: [
            { value: 'assets/image-icon1.svg', content: '<img height="42px" src="assets/image-icon1.svg"/>' },
            { value: 'assets/image-icon2.svg', content: '<img height="80px" src="assets/image-icon2.svg"/>' },
            { value: 'assets/image-icon3.svg', content: '<img height="80px" src="assets/image-icon3.svg"/>' },
            { value: 'assets/image-icon4.svg', content: '<img height="80px" src="assets/image-icon4.svg"/>' }
        ],

        imageGender: [
            { value: 'assets/member-male.png', content: '<img height="50px" src="assets/member-male.png" style="margin: 5px 0 0 2px;"/>' },
            { value: 'assets/member-female.png', content: '<img height="50px" src="assets/member-female.png" style="margin: 5px 0 0 2px;"/>' }
        ],

        arrowheadSize: [
            { value: 'scale(0.001)', content: 'Ninguna' },
            { value: 'scale(1)', content: 'Pequeña' },
            { value: 'scale(2)', content: 'Medio' },
            { value: 'scale(4)', content: 'Grande' }
        ],

        strokeWidth: [
            { value: 1, content: '<div style="background:#fff;width:2px;height:30px;margin:0 14px;border-radius: 2px;"/>' },
            { value: 2, content: '<div style="background:#fff;width:4px;height:30px;margin:0 13px;border-radius: 2px;"/>' },
            { value: 4, content: '<div style="background:#fff;width:8px;height:30px;margin:0 11px;border-radius: 2px;"/>' },
            { value: 8, content: '<div style="background:#fff;width:16px;height:30px;margin:0 8px;border-radius: 2px;"/>' }
        ],

        router: [
            { value: 'normal', content: '<p style="background:#fff;width:2px;height:30px;margin:0 14px;border-radius: 2px;"/>' },
            { value: 'orthogonal', content: '<p style="width:20px;height:30px;margin:0 5px;border-bottom: 2px solid #fff;border-left: 2px solid #fff;"/>' },
            { value: 'oneSide', content: '<p style="width:20px;height:30px;margin:0 5px;border: 2px solid #fff;border-top: none;"/>' }
        ],

        connector: [
            { value: 'normal', content: '<p style="width:20px;height:20px;margin:5px;border-top:2px solid #fff;border-left:2px solid #fff;"/>' },
            { value: 'rounded', content: '<p style="width:20px;height:20px;margin:5px;border-top-left-radius:30%;border-top:2px solid #fff;border-left:2px solid #fff;"/>' },
            { value: 'smooth', content: '<p style="width:20px;height:20px;margin:5px;border-top-left-radius:100%;border-top:2px solid #fff;border-left:2px solid #fff;"/>' }
        ],

        labelPosition: [
            { value: 30, content: 'Cerca de la fuente' },
            { value: 0.5, content: 'En el medio' },
            { value: -30, content: 'Cerca del objetivo' },
        ],

        portMarkup: [
            { value: '<rect class="port-body" width="20" height="20" x="-10" y="-10"/>', content: 'Rectángulo' },
            { value: '<circle class="port-body" r="10"/>', content: 'Circulo' },
            { value: '<path class="port-body" d="M -10 -10 10 -10 0 10 z"/>', content: 'Triángulo' }
        ]
    };

    App.config.inspector = {

        'app.Link': {
            inputs: {
                attrs: {
                   /*  '.connection': {
                        'stroke-width': {
                            type: 'select-button-group',
                            options: options.strokeWidth,
                            group: 'connection',
                            label: 'Link thickness',
                            when: { ne: { 'attrs/.connection/stroke': 'transparent' }},
                            index: 4
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            group: 'connection',
                            label: 'Link style',
                            when: { ne: { 'attrs/.connection/stroke': 'transparent' }},
                            index: 5
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            group: 'connection',
                            label: 'Color',
                            index: 6
                        }
                    },
                    '.marker-source': {
                        transform: {
                            type: 'select-box',
                            options: options.arrowheadSize,
                            group: 'marker-source',
                            label: 'Source arrowhead',
                            index: 1
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            group: 'marker-source',
                            label: 'Color',
                            when: { ne: { 'attrs/.marker-source/transform': 'scale(0.001)'}},
                            index: 2
                        }
                    },
                    '.marker-target': {
                        transform: {
                            type: 'select-box',
                            options: options.arrowheadSize,
                            group: 'marker-target',
                            label: 'Target arrowhead',
                            index: 1
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            group: 'marker-target',
                            label: 'Color',
                            when: { ne: { 'attrs/.marker-target/transform': 'scale(0.001)'}},
                            index: 2
                        }
                    } */
                },
               /*  router: {
                    name: {
                        type: 'select-button-group',
                        options: options.router,
                        group: 'connection',
                        label: 'Connection type',
                        index: 1
                    },
                    args: {
                        side: {
                            type: 'select-box',
                            options: options.side,
                            placeholder: 'Pick a side',
                            group: 'connection',
                            label: 'Anchors side',
                            when: { eq: { 'router/name': 'oneSide' }, otherwise: { unset: true }},
                            index: 2
                        }
                    }
                }, */
                /* connector: {
                    name: {
                        type: 'select-button-group',
                        options: options.connector,
                        group: 'connection',
                        label: 'Connection style',
                        index: 3
                    }
                }, */
                labels: {
                    type: 'list',
                    group: 'labels',
                    label: 'Etiquetas',
                    attrs: {
                        label: {
                            'data-tooltip': 'Set (possibly multiple) labels for the link',
                            'data-tooltip-position': 'right',
                            'data-tooltip-position-selector': '.joint-inspector'
                        }
                    },
                    item: {
                        type: 'object',
                        properties: {
                            attrs: {
                                text: {
                                    text: {
                                        type: 'text',
                                        label: 'Etiqueta',
                                        defaultValue: 'label',
                                        index: 1,
                                        attrs: {
                                            label: {
                                                'data-tooltip': 'Establecer texto de la etiqueta',
                                                'data-tooltip-position': 'right',
                                                'data-tooltip-position-selector': '.joint-inspector'
                                            }
                                        }
                                    }
                                }
                            },
                           /*  position: {
                                type: 'select-box',
                                options: options.labelPosition || [],
                                defaultValue: 0.5,
                                label: 'Position',
                                index: 2,
                                attrs: {
                                    label: {
                                        'data-tooltip': 'Position the label relative to the source of the link',
                                        'data-tooltip-position': 'right',
                                        'data-tooltip-position-selector': '.joint-inspector'
                                    }
                                }
                            } */
                        }
                    }
                }
            },
            groups: {
                connection: {
                    label: 'Connection',
                    index: 1
                },
                'marker-source': {
                    label: 'Source marker',
                    index: 2
                },
                'marker-target': {
                    label: 'Target marker',
                    index: 3
                },
                labels: {
                    label: 'Etiquetas',
                    index: 4
                }
            }
        },
        'basic.Rect': {
            inputs: {
                attrs: {
                    text: {
                        text: {
                            type: 'content-editable',
                            label: 'Texto',
                            group: 'text',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    rect: {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/rect/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/rect/stroke': 'transparent' }},
                                    { ne: { 'attrs/rect/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                }
            },
            groups: {
                presentation: {
                    label: 'Presentation',
                    index: 1
                },
                text: {
                    label: 'TEXTO',
                    index: 2
                }
            }
        },
        'basic.Circle': {
            inputs: {
                attrs: {
                    text: {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'text',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    circle: {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/circle/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/circle/stroke': 'transparent' }},
                                    { ne: { 'attrs/circle/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                }
            },
            groups: {
                presentation: {
                    label: 'Presentation',
                    index: 1
                },
                text: {
                    label: 'Text',
                    index: 2
                }
            }
        },
        'basic.Image': {
            inputs: {
                attrs: {
                    text: {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'text',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    image: {
                        'xlink:href': {
                            type: 'select-box',
                            options: options.imageIcons,
                            label: 'Image',
                            group: 'presentation',
                            index: 1
                        }
                    }
                }
            },
            groups: {
                presentation: {
                    label: 'Presentation',
                    index: 1
                },
                text: {
                    label: 'Text',
                    index: 2
                }
            }
        },
        'app.RectangularModel': {
            inputs: {
                attrs: {
                    '.label': {
                        text: {
                            type: 'content-editable',
                            label: 'Texto',
                            group: 'text',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Tamaño de fuente',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Familia tipográfica',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Espesor de la fuente',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Llenar',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 5
                        }
                    },
                    '.body': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Llenar',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'contorno',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Grosor del contorno',
                            group: 'presentation',
                            when: { ne: { 'attrs/.body/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Estilo de esquema',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.body/stroke': 'transparent' }},
                                    { ne: { 'attrs/.body/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                },
                ports: {
                    groups: {
                        'in': {
                            attrs: {
                                '.port-body': {
                                    fill: {
                                        type: 'color-palette',
                                        options: options.colorPalette,
                                        label: 'Llenar',
                                        when: { not: { equal: { inPorts: [] }}},
                                        group: 'inPorts',
                                        index: 1
                                    }
                                }
                            },
                            position: {
                                name: {
                                    type: 'select-box',
                                    options: options.side,
                                    label: 'Posición',
                                    when: { not: { equal: { inPorts: [] }}},
                                    group: 'inPorts',
                                    index: 3
                                }
                            },
                            label: {
                                position: {
                                    type: 'select-box',
                                    options: options.portLabelPositionRectangle,
                                    label: 'Posición del texto',
                                    when: { not: { equal: { inPorts: [] }}},
                                    group: 'inPorts',
                                    index: 4
                                }
                            },
                            markup: {
                                type: 'select-box',
                                options: options.portMarkup,
                                label: 'Forma de puerto',
                                group: 'inPorts',
                                index: 5
                            }
                        },
                        'out': {
                            attrs: {
                                '.port-body': {
                                    fill: {
                                        type: 'color-palette',
                                        options: options.colorPalette,
                                        label: 'Llenar',
                                        when: { not: { equal: { outPorts: [] }}},
                                        group: 'outPorts',
                                        index: 2
                                    }
                                }
                            },
                            position: {
                                name: {
                                    type: 'select-box',
                                    options: options.side,
                                    label: 'Posición',
                                    when: { not: { equal: { outPorts: [] }}},
                                    group: 'outPorts',
                                    index: 4
                                }
                            },
                            label: {
                                position: {
                                    type: 'select-box',
                                    options: options.portLabelPositionRectangle,
                                    label: 'Posición del texto',
                                    when: { not: { equal: { outPorts: [] }}},
                                    group: 'outPorts',
                                    index: 5
                                }
                            },
                            markup: {
                                type: 'select-box',
                                options: options.portMarkup,
                                label: 'Forma de puerto',
                                group: 'outPorts',
                                index: 6
                            }
                        }
                    }
                },
                inPorts: {
                    type: 'list',
                    label: 'Puertos',
                    item: {
                        type: 'text'
                    },
                    group: 'inPorts',
                    index: 0
                },
                outPorts: {
                    type: 'list',
                    label: 'Puertos',
                    item: {
                        type: 'text'
                    },
                    group: 'outPorts',
                    index: 0
                }
            },
            groups: {
                inPorts: {
                    label: 'Puertos de entrada',   
                    index: 1
                },
                outPorts: {
                    label: 'Puertos de salida',
                    index: 2
                },
                presentation: {
                    label: 'Presentación',
                    index: 3
                },
                text: {
                    label: 'Texto',
                    index: 4
                }
            }
        },
        'app.CircularModel': {
            inputs: {
                attrs: {
                    '.label': {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'text',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 5
                        }
                    },
                    '.body': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.body/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.body/stroke': 'transparent' }},
                                    { ne: { 'attrs/.body/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                },
                ports: {
                    groups: {
                        'in': {
                            attrs: {
                                '.port-body': {
                                    fill: {
                                        type: 'color-palette',
                                        options: options.colorPalette,
                                        label: 'Fill',
                                        when: { not: { equal: { inPorts: [] }}},
                                        group: 'inPorts',
                                        index: 1
                                    }
                                }
                            },
                            position: {
                                args: {
                                    startAngle: {
                                        type: 'range',
                                        min: 0,
                                        max: 360,
                                        step: 1,
                                        defaultValue: 0,
                                        unit: '°',
                                        label: 'Position',
                                        when: { not: { equal: { inPorts: [] }}},
                                        group: 'inPorts',
                                        index: 3
                                    }
                                }
                            },
                            label: {
                                position: {
                                    name: {
                                        type: 'select-button-group',
                                        options: options.portLabelPositionEllipse,
                                        label: 'Text direction',
                                        when: { not: { equal: { inPorts: [] }}},
                                        group: 'inPorts',
                                        index: 4
                                    }
                                }
                            },
                            markup: {
                                type: 'select-box',
                                options: options.portMarkup,
                                label: 'Port Shape',
                                group: 'inPorts',
                                index: 5
                            }
                        },
                        'out': {
                            attrs: {
                                '.port-body': {
                                    fill: {
                                        type: 'color-palette',
                                        options: options.colorPalette,
                                        label: 'Fill',
                                        when: { not: { equal: { outPorts: [] }}},
                                        group: 'outPorts',
                                        index: 2
                                    }
                                }
                            },
                            position: {
                                args: {
                                    startAngle: {
                                        type: 'range',
                                        min: 0,
                                        max: 360,
                                        step: 1,
                                        defaultValue: 180,
                                        unit: '°',
                                        label: 'Position',
                                        when: { not: { equal: { outPorts: [] }}},
                                        group: 'outPorts',
                                        index: 4
                                    }
                                }
                            },
                            label: {
                                position: {
                                    name: {
                                        type: 'select-button-group',
                                        options: options.portLabelPositionEllipse,
                                        label: 'Text Position',
                                        when: { not: { equal: { outPorts: [] }}},
                                        group: 'outPorts',
                                        index: 5
                                    }
                                }
                            },
                            markup: {
                                type: 'select-box',
                                options: options.portMarkup,
                                label: 'Port Shape',
                                group: 'outPorts',
                                index: 6
                            }
                        }
                    }
                },
                inPorts: {
                    type: 'list',
                    label: 'Ports',
                    item: {
                        type: 'text'
                    },
                    group: 'inPorts',
                    index: 0
                },
                outPorts: {
                    type: 'list',
                    label: 'Ports',
                    item: {
                        type: 'text'
                    },
                    group: 'outPorts',
                    index: 0
                }
            },
            groups: {
                inPorts: {
                    label: 'Input Ports',
                    index: 1
                },
                outPorts: {
                    label: 'Output Ports',
                    index: 2
                },
                presentation: {
                    label: 'Presentation',
                    index: 3
                },
                text: {
                    label: 'Text',
                    index: 4
                }
            }
        },
        'fsa.StartState': {
            inputs: {
                attrs: {
                    circle: {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Llenar',
                            group: 'presentation',
                            index: 1
                        }
                    }
                }
            },
            groups: {
                presentation: {
                    label: 'Presentación',
                    index: 1
                }
            }
        },
        'bpmn.Event': {
          inputs:{  
            eventType: {
                type: 'select',
                options: ['start','end','intermediate'],
                group: 'general',
                label: 'Type',
                index: 2
            },
            icon: {
                type: 'select',
                options: [
                    { value: 'none', content: 'ninguno' },
                    { value: 'cross', content: 'cancelar' },
                    { value: 'message', content: 'mensaje' },
                    { value: 'plus', content: 'múltiplo paralelo' }
                ],
                label: 'Subtipo',
                group: 'general',
                index: 3
            },
            attrs: {
                '.label/text': {
                    type: 'text',
                    label: 'Nombre',
                    group: 'general',
                    index: 1
                },
                '.body/fill': {
                    type: 'color',
                    label: 'Color del cuerpo',
                    group: 'apariencia',
                    index: 1
                }
            }
         } 
        },
        'bpmn.Activity': {
         inputs:{   
            content: {
                type: 'textarea',
                label: 'Contenido',
                group: 'general',
                index: 1
            },
            icon: {
                type: 'select',
                options: ['none','message','user'],
                label: 'Icon',
                group: 'general',
                index: 2
            },
            activityType: {
                type: 'select',
                options: ['task', 'transaction', 'event-sub-process', 'call-activity'],
                label: 'Tipo',
                group: 'general',
                index: 3
            },
            subProcess: {
                type: 'toggle',
                label: 'Subproceso',
                group: 'general',
                index: 4
            },
            attrs: {
                '.body/fill': {
                    type: 'color',
                    label: 'Color del cuerpo',
                    group: 'apariencia',
                    index: 1
                }
            }
            
        },
        groups: {
            general1: {
                label: 'Tipo',
                index: 1
            },
            general2: {
                label: 'Tipo2',
                index: 2
            },
            appearance:{
                label: 'apariencia',
                index: 3
            }
        }
    } ,
        'bpmn.Gateway': {
            inputs: {
                icon: {
                    type: 'select',
                    options: [
                        { value: 'none', content: 'defecto' },
                        { value: 'cross', content: 'exclusiva' },
                        { value: 'circle', content: 'inclusiva' },
                        { value: 'plus', content: 'paralela' }
                    ],
                    label: 'Tipo',
                    group: 'general1',
                    index: 2
                },
                attrs: {
                    '.label/text': {
                        type: 'text',
                        label: 'Nombre',
                        group: 'general2',
                        index: 1
                    },
                    '.body/fill': {
                        type: 'color',
                        label: 'Color del cuerpo',
                        group: 'apariencia',
                        index: 1
                    }
                }
            },
            groups: {
                general1: {
                    label: 'Tipo',
                    index: 1
                },
                general2: {
                    label: 'Tipo2',
                    index: 2
                },
                appearance:{
                    label: 'apariencia',
                    index: 3
                }
            }
        },
'bpmn.Group': {
    inputs:{
            attrs: {
                '.label/text': {
                    type: 'text',
                    label: 'Nombre',
                    group: 'general',
                    index: 1
                },
                '.label-rect/fill': {
                    type: 'color',
                    label: 'Color del cuerpo',
                    group: 'apariencia',
                    index: 1
                }
            }
        },
    groups: {
        appearance:{
            label: 'apariencia',
            index: 1
        }
    }
},
'bpmn.DataObject': {
  inputs:{ 
    attrs: {
        '.label/text': {
            type: 'text',
            label: 'Nombre',
            group: 'general',
            index: 1
        },
        '.body/fill': {
            type: 'color',
            label: 'Color del cuerpo',
            group: 'apariencia',
            index: 1
        }
    }
  },
    groups:{
        appearance:{
            label: 'apariencia',
            index: 1
        }
    }
 
},

'bpmn.Choreography': {
   inputs:{ 
    participants: {
        type: 'list',
        label: 'Participantes',
        item: {
            type: 'text'
        },
        group: 'general',
        index: 1
    },
    initiatingParticipant: {
        type: 'select',
        label: 'Participante iniciador',
        options: 'participants',
        group: 'general',
        index: 2
    },
    subProcess: {
        type: 'toggle',
        label: 'Subproceso',
        group: 'general',
        index: 3
    },
    content: {
        type: 'textarea',
        label: 'Contenido',
        group: 'general',
        index: 4
    },
    attrs: {
        '.body/fill': {
            type: 'color',
            label: 'Color primario',
            group: 'apariencia',
            index: 1
        },
        '.participant-rect/fill': {
            type: 'color',
            label: 'Color secundario',
            group: 'apariencia',
            index: 2
        }
    }
},
groups:{
    appearance:{
        label: 'apariencia',
        index: 1
    }
} 
},
'bpmn.Message': {
  inputs:{

  
    attrs: {
        '.label/text': {
            type: 'text',
            label: 'Nombre',
            group: 'general',
            index: 1
        },
        '.body/fill': {
            type: 'color',
            label: 'Color del cuerpo',
            group: 'apariencia',
            index: 1
        }
    }
  },
  groups: { 
    appearance:{
        label: 'apariencia',
        index: 1
    }
}  
},
'bpmn.Annotation': {
        inputs:{  
            content: {
                type: 'textarea',
                label: 'Contenido',
                group: 'general',
                index: 1
            },
            attrs: {
                '.body/fill': {
                    type: 'color',
                    label: 'Color del cuerpo',
                    group: 'apariencia',
                    index: 1
                },
                '.body/fill-opacity': {
                    type: 'range',
                    min: 0,
                    max: 1,
                    step: 0.1,
                    label: 'Transparencia',
                    group: 'apariencia',
                    index: 2
                }
    
            }
        },
        groups: { 
            appearance:{
                label: 'apariencia',
                index: 1
            }
        }
    } ,
        
    'bpmn.Conversation': {
        inputs: {  
            conversationType: {
                type: 'select',
                options: ['conversation', 'call-conversation'],
                label: 'Tipo',
                group: 'general',
                index: 2
            },
            subProcess: {
                type: 'toggle',
                label: 'Subproceso',
                group: 'general',
                index: 3
            },
            attrs: {
                '.label/text': {
                    type: 'text',
                    label: 'Nombre',
                    group: 'general',
                    index: 1
                },
                '.body/fill': {
                    type: 'color',
                    label: 'Color del cuerpo',
                    group: 'apariencia',
                    index: 1
                }
            }
        },
        groups: {
            general1: {
                label: 'Tipo',
                index: 3
            },
            text: {
                label: 'Texto',
                index: 2
            },
            appearance:{
                label: 'apariencia',
                index: 1
            }
        }
    },

'bpmn.Pool': {
    inputs: { 
        lanes: {
            type: 'object',
            group: 'general',
            index: 1,
            attrs: {
                label: {
                    style: 'display:none;'
                }
            },
            properties: {
                label: {
                    type: 'text',
                    label: 'Label'
                },
                sublanes: {
                    type: 'list',
                    label: 'Add lanes',
                    item: {
                        type: 'object',
                        properties: {
                            label: {
                                type: 'text',
                                label: 'Label',
                                attrs: {
                                    label: {
                                        style: 'display:none;'
                                    }
                                }
                            },
                            sublanes: {
                                type: 'list',
                                label: 'Add sublanes',
                                item: {
                                    type: 'object',
                                    properties: {
                                        label: {
                                            type: 'text',
                                            label: 'Label',
                                            attrs: {
                                                label: {
                                                    style: 'display:none;'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        attrs: {
            '.body/fill': {
                type: 'color',
                label: 'Color del cuerpo',
                group: 'apariencia',
                index: 1
            },
            '.header/fill': {
                type: 'color',
                label: 'Color del encabezado',
                group: 'apariencia',
                index: 2
            },
            '.lane-body/fill': {
                type: 'color',
                label: 'Color del cuerpo del carril',
                group: 'apariencia',
                index: 3
            },
            '.lane-header/fill': {
                type: 'color',
                label: 'Color del encabezado de carril',
                group: 'apariencia',
                index: 4
            }
        }
    },
    groups: {
        general1: {
            label: 'Tipo',
            index: 3
        },
        text: {
            label: 'Texto',
            index: 2
        },
        appearance:{
            label: 'apariencia',
            index: 1
        }
    }
  },
        'fsa.EndState': {
            inputs: {
                attrs: {
                     '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    },
                    '.inner': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Inner fill',
                            group: 'presentation',
                            index: 2
                        }
                    } 
                }
            },
            groups: {
                presentation: {
                    label: 'Presentation',
                    index: 1
                },
                text: {
                    label: 'Text',
                    index: 2
                }
            }
        },
        'basic.Path': {
            inputs: {
                attrs: {
                    text: {
                        text: {
                            type: 'content-editable',
                            label: 'Texto',
                            group: 'text',
                            index: 1
                        }
                    }
                }
            },
            groups: {
                presentation: {
                    label: 'Presentación',
                    index: 1
                },
                text: {
                    label: 'Texto',
                    index: 2
                }
            }
        },
        'pn.Place': {
            inputs: {
                attrs: {
                    '.label': {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'text',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 5
                        }
                    },
                    '.root': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.root/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.root/stroke': 'transparent' }},
                                    { ne: { 'attrs/.root/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                },
                tokens: {
                    type: 'number',
                    min: 1,
                    max: 500,
                    group: 'data',
                    index: 1
                }
            },
            groups: {
                presentation: {
                    label: 'Presentation',
                    index: 2
                },
                text: {
                    label: 'Text',
                    index: 3
                },
                data: {
                    label: 'Data',
                    index: 1
                }
            }
        },
        'pn.Transition': {
            inputs: {
                attrs: {
                    '.label': {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'text',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/.label/text': '' }},
                            index: 5
                        }
                    },
                    rect: {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/rect/stroke': 'transparent' }},
                            index: 2
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/rect/stroke': 'transparent' }},
                                    { ne: { 'attrs/rect/stroke-width': 0 }}
                                ]
                            },
                            index: 3
                        }
                    }
                }
            },
            groups: {
                presentation: {
                    label: 'Presentation',
                    index: 1
                },
                text: {
                    label: 'Text',
                    index: 2
                }
            }
        },
        'erd.Entity': {
            inputs: {
                attrs: {
                    text: {
                        text: {
                            type: 'content-editable',
                            label: 'Texto',
                            group: 'text',
                            index: 1
                        }/* ,
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        } */
                    }
                }
            },
            groups: {
                presentation: {
                    label: 'Presentation',
                    index: 1
                },
                text: {
                    label: 'TEXTO',
                    index: 2
                }
            }
        },
        'erd.WeakEntity': {
            inputs: {
                attrs: {
                    text: {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'text',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'outer',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'outer',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'outer',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'outer',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    },
                    '.inner': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'inner',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'inner',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'inner',
                            when: { ne: { 'attrs/.inner/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'inner',
                            when: {
                                and: [
                                    { ne: { 'attrs/.inner/stroke': 'transparent' }},
                                    { ne: { 'attrs/.inner/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                }
            },
            groups: {
                text: {
                    label: 'Text',
                    index: 1
                },
                outer: {
                    label: 'Outer rectangle',
                    index: 2
                },
                inner: {
                    label: 'Inner rectangle',
                    index: 3
                }
            }
        },
        'erd.Relationship': {
            inputs: {
                attrs: {
                    text: {
                        text: {
                            type: 'content-editable',
                            label: 'Texto',
                            group: 'text',
                            index: 1
                        }/* ,
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        } */
                    }
                }
            },
            groups: {
                presentation: {
                    label: 'Presentation',
                    index: 1
                },
                text: {
                    label: 'TEXTO',
                    index: 2
                }
            }
        },
        'erd.IdentifyingRelationship': {
            inputs: {
                attrs: {
                    text: {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'text',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'outer',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'outer',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'outer',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'outer',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    },
                    '.inner': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'inner',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'inner',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'inner',
                            when: { ne: { 'attrs/.inner/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'inner',
                            when: {
                                and: [
                                    { ne: { 'attrs/.inner/stroke': 'transparent' }},
                                    { ne: { 'attrs/.inner/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                }
            },
            groups: {
                text: {
                    label: 'Text',
                    index: 1
                },
                outer: {
                    label: 'Outer polygon',
                    index: 2
                },
                inner: {
                    label: 'Inner polygon',
                    index: 3
                }
            }
        },
        'erd.Key': {
            inputs: {
                attrs: {
                    text: {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'text',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'outer',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'outer',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'outer',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'outer',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    },
                    '.inner': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'inner',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'inner',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'inner',
                            when: { ne: { 'attrs/.inner/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'inner',
                            when: {
                                and: [
                                    { ne: { 'attrs/.inner/stroke': 'transparent' }},
                                    { ne: { 'attrs/.inner/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                }
            },
            groups: {
                text: {
                    label: 'Text',
                    index: 1
                },
                outer: {
                    label: 'Outer ellipse',
                    index: 2
                },
                inner: {
                    label: 'Inner ellipse',
                    index: 3
                }
            }
        },
        'erd.Normal': {
            inputs: {
                attrs: {
                    text: {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'text',
                            index: 1
                        }/* ,
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        } */
                    }
                }
            },
            groups: {
                presentation: {
                    label: 'Presentation',
                    index: 1
                },
                text: {
                    label: 'Text',
                    index: 2
                }
            }
        },
        'erd.Multivalued': {
            inputs: {
                attrs: {
                    text: {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'text',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'outer',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'outer',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'outer',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'outer',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    },
                    '.inner': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'inner',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'inner',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'inner',
                            when: { ne: { 'attrs/.inner/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'inner',
                            when: {
                                and: [
                                    { ne: { 'attrs/.inner/stroke': 'transparent' }},
                                    { ne: { 'attrs/.inner/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                }
            },
            groups: {
                text: {
                    label: 'Text',
                    index: 1
                },
                outer: {
                    label: 'Outer ellipse',
                    index: 2
                },
                inner: {
                    label: 'Inner ellipse',
                    index: 3
                }
            }
        },
        'erd.Derived': {
            inputs: {
                attrs: {
                    text: {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'text',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    '.outer': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'outer',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'outer',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'outer',
                            when: { ne: { 'attrs/.outer/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'outer',
                            when: {
                                and: [
                                    { ne: { 'attrs/.outer/stroke': 'transparent' }},
                                    { ne: { 'attrs/.outer/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    },
                    '.inner': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'inner',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'inner',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'inner',
                            when: { ne: { 'attrs/.inner/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'inner',
                            when: {
                                and: [
                                    { ne: { 'attrs/.inner/stroke': 'transparent' }},
                                    { ne: { 'attrs/.inner/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                }
            },
            groups: {
                text: {
                    label: 'Text',
                    index: 1
                },
                outer: {
                    label: 'Outer ellipse',
                    index: 2
                },
                inner: {
                    label: 'Inner ellipse',
                    index: 3
                }
            }
        },
        'erd.ISA': {
            inputs: {
                attrs: {
                    text: {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'text',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'attrs/text/text': '' }},
                            index: 5
                        }
                    },
                    polygon: {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/polygon/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/polygon/stroke': 'transparent' }},
                                    { ne: { 'attrs/polygon/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    }
                }
            },
            groups: {
                presentation: {
                    label: 'Presentation',
                    index: 1
                },
                text: {
                    label: 'Text',
                    index: 2
                }
            }
        },
        'uml.Class': {
            inputs: {
                attrs: {
                    '.uml-class-name-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'name',
                            index: 4
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'name',
                            index: 5
                        }
                    },
                    '.uml-class-attrs-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'attributes',
                            index: 4
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'attributes',
                            index: 5
                        }
                    },
                    '.uml-class-methods-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'methods',
                            index: 4
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'methods',
                            index: 5
                        }
                    }
                },
                name: {
                    type: 'text',
                    group: 'name',
                    index: 1,
                    label: 'Class name'
                },
                attributes: {
                    type: 'list',
                    item: {
                        type: 'text'
                    },
                    group: 'attributes',
                    index: 1,
                    label: 'Attributes'
                },
                methods: {
                    type: 'list',
                    item: {
                        type: 'text'
                    },
                    group: 'methods',
                    index: 1,
                    label: 'Methods'
                }
            },
            groups: {
                name: {
                    label: 'Class name',
                    index: 1
                },
                attributes: {
                    label: 'Attributes',
                    index: 2
                },
                methods: {
                    label: 'Methods',
                    index: 3
                }
            }
        },
        'uml.Interface': {
            inputs: {
                attrs: {
                    '.uml-class-name-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'name',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'name',
                            index: 2
                        }
                    },
                    '.uml-class-attrs-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'attributes',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'attributes',
                            index: 2
                        }
                    },
                    '.uml-class-methods-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'methods',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'methods',
                            index: 2
                        }
                    }
                },
                name: {
                    type: 'text',
                    group: 'name',
                    index: 0,
                    label: 'Interface name'
                },
                attributes: {
                    type: 'list',
                    item: {
                        type: 'text'
                    },
                    group: 'attributes',
                    index: 0,
                    label: 'Attributes'
                },
                methods: {
                    type: 'list',
                    item: {
                        type: 'text'
                    },
                    group: 'methods',
                    index: 0,
                    label: 'Methods'
                }
            },
            groups: {
                name: {
                    label: 'Interface name',
                    index: 1
                },
                attributes: {
                    label: 'Attributes',
                    index: 2
                },
                methods: {
                    label: 'Methods',
                    index: 3
                }
            }
        },
        'uml.Abstract': {
            inputs: {
                attrs: {
                    '.uml-class-name-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'name',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'name',
                            index: 2
                        }
                    },
                    '.uml-class-attrs-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'attributes',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'attributes',
                            index: 2
                        }
                    },
                    '.uml-class-methods-rect': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'methods',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'methods',
                            index: 2
                        }
                    }
                },
                name: {
                    type: 'text',
                    group: 'name',
                    index: 0,
                    label: 'Abstract class name'
                },
                attributes: {
                    type: 'list',
                    item: {
                        type: 'text'
                    },
                    group: 'attributes',
                    index: 0,
                    label: 'Attributes'
                },
                methods: {
                    type: 'list',
                    item: {
                        type: 'text'
                    },
                    group: 'methods',
                    index: 0,
                    label: 'Methods'
                }
            },
            groups: {
                name: {
                    label: 'Abstract class name',
                    index: 1
                },
                attributes: {
                    label: 'Attributes Text',
                    index: 2
                },
                methods: {
                    label: 'Methods Text',
                    index: 3
                }
            }
        },
        'uml.State': {
            inputs: {
                name: {
                    group: 'text',
                    index: 1,
                    type: 'text'
                },
                events: {
                    group: 'events',
                    index: 1,
                    type: 'list',
                    item: {
                        type: 'text'
                    }
                },
                attrs: {
                    '.uml-state-name': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'text',
                            when: { ne: { 'name': '' }},
                            index: 5
                        }
                    },
                    '.uml-state-body': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.uml-state-body/stroke': 'transparent' }},
                            index: 4
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.uml-state-body/stroke': 'transparent' }},
                                    { ne: { 'attrs/.uml-state-body/stroke-width': 0 }}
                                ]
                            },
                            index: 5
                        }
                    },
                    '.uml-state-separator': {
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Horizontal rule outline',
                            group: 'presentation',
                            index: 3
                        }
                    },
                    '.uml-state-events': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'events',
                            when: { ne: { 'events': 0 }},
                            index: 5
                        }
                    }
                }
            },
            groups: {
                presentation: {
                    label: 'Presentation',
                    index: 1
                },
                text: {
                    label: 'State name text',
                    index: 2
                },
                events: {
                    label: 'State events text',
                    index: 3
                }
            }
        },
        'org.Member': {
            inputs: {
                attrs: {
                    '.rank': {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'rank',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'rank',
                            when: { ne: { 'attrs/.rank/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'rank',
                            when: { ne: { 'attrs/.rank/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'rank',
                            when: { ne: { 'attrs/.rank/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'rank',
                            when: { ne: { 'attrs/.rank/text': '' }},
                            index: 5
                        }
                    },
                    '.name': {
                        text: {
                            type: 'content-editable',
                            label: 'Text',
                            group: 'name',
                            index: 1
                        },
                        'font-size': {
                            type: 'range',
                            min: 5,
                            max: 80,
                            unit: 'px',
                            label: 'Font size',
                            group: 'name',
                            when: { ne: { 'attrs/.name/text': '' }},
                            index: 2
                        },
                        'font-family': {
                            type: 'select-box',
                            options: options.fontFamily,
                            label: 'Font family',
                            group: 'name',
                            when: { ne: { 'attrs/.name/text': '' }},
                            index: 3
                        },
                        'font-weight': {
                            type: 'select-box',
                            options: options.fontWeight,
                            label: 'Font thickness',
                            group: 'name',
                            when: { ne: { 'attrs/.name/text': '' }},
                            index: 4
                        },
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'name',
                            when: { ne: { 'attrs/.name/text': '' }},
                            index: 5
                        }
                    },
                    '.card': {
                        fill: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Fill',
                            group: 'presentation',
                            index: 1
                        },
                        stroke: {
                            type: 'color-palette',
                            options: options.colorPalette,
                            label: 'Outline',
                            group: 'presentation',
                            index: 2
                        },
                        'stroke-width': {
                            type: 'range',
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 1,
                            unit: 'px',
                            label: 'Outline thickness',
                            group: 'presentation',
                            when: { ne: { 'attrs/.card/stroke': 'transparent' }},
                            index: 3
                        },
                        'stroke-dasharray': {
                            type: 'select-box',
                            options: options.strokeStyle,
                            label: 'Outline style',
                            group: 'presentation',
                            when: {
                                and: [
                                    { ne: { 'attrs/.card/stroke': 'transparent' }},
                                    { ne: { 'attrs/.card/stroke-width': 0 }}
                                ]
                            },
                            index: 4
                        }
                    },
                    image: {
                        'xlink:href': {
                            type: 'select-button-group',
                            options: options.imageGender,
                            label: 'Gender',
                            group: 'gender',
                            index: 1
                        }
                    }
                }
            },
            groups: {
                presentation: {
                    label: 'Presentation',
                    index: 4
                },
                rank: {
                    label: 'Rank',
                    index: 2
                },
                name: {
                    label: 'Name',
                    index: 3
                },
                gender: {
                    label: 'Gender',
                    index: 1
                }
            }
        }
    };

})();
