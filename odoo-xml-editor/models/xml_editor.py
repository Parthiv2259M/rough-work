# -*- coding: utf-8 -*-
from lxml import etree
from odoo import _, api, fields, models
from odoo.exceptions import UserError


class XmlEditor(models.Model):
    _name = 'xml.editor'
    _description = 'XML View Editor'
    _order = 'write_date desc'

    name = fields.Char(string='Label', compute='_compute_name', store=True)
    view_id = fields.Many2one(
        'ir.ui.view', string='Target View', required=True, ondelete='cascade',
        help='The Odoo view whose XML architecture you want to edit.'
    )
    view_type = fields.Selection(related='view_id.type', string='View Type', store=True, readonly=True)
    model_name = fields.Char(related='view_id.model', string='Model', store=True, readonly=True)
    xml_content = fields.Text(string='XML Content')
    active = fields.Boolean(default=True)

    @api.depends('view_id', 'view_id.name')
    def _compute_name(self):
        for rec in self:
            rec.name = rec.view_id.name or 'Untitled Editor'

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('view_id') and not vals.get('xml_content'):
                view = self.env['ir.ui.view'].browse(vals['view_id'])
                vals['xml_content'] = view.arch_db
        return super().create(vals_list)

    def action_load_from_view(self):
        """Reload xml_content from the linked view, discarding local edits."""
        for rec in self:
            if not rec.view_id:
                raise UserError(_("Select a target view first."))
            rec.xml_content = rec.view_id.arch_db

    def action_save_to_view(self):
        """Validate and write xml_content back onto the linked ir.ui.view."""
        for rec in self:
            if not rec.view_id:
                raise UserError(_("Select a target view first."))
            if not rec.xml_content or not rec.xml_content.strip():
                raise UserError(_("XML content cannot be empty."))
            try:
                etree.fromstring(rec.xml_content.encode('utf-8'))
            except etree.XMLSyntaxError as e:
                raise UserError(_("Invalid XML: %s") % str(e))
            rec.view_id.write({'arch_db': rec.xml_content})
        return True