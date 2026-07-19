{
    'name': 'Odoo XML Editor',
    'version': '1.0.0',
    'category': 'Tools',
    'summary': 'Visual XML Editor for all Odoo Web UI Pages',
    'description': 'A visual editor for modifying the XML architecture of Odoo views.',
    'author': 'Parthiv2259M',
    'website': 'https://github.com/Parthiv2259M/odoo-xml-editor',
    'license': 'LGPL-3',
    'depends': ['base', 'web'],
    'data': [
        'security/ir.model.access.csv',
        'views/xml_editor_views.xml',
        'views/xml_editor_menu.xml',
    ],
    'static': {
        'description': 'Static files for XML Editor interface',
    },
    'installable': True,
    'auto_install': False,
    'application': False,
}
