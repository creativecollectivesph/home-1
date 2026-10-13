/* V9 light-touch interactions. This file does not replace authentication or portal logic. */
(() => {
  'use strict';
  const roleMap = {
    operations: 'Business operations / project support',
    sales: 'Sales & CRM',
    support: 'Customer support',
    creative: 'Marketing operations',
    admin: 'Executive & administrative support',
    marketing: 'Marketing operations'
  };
  const roleLink = document.querySelector('.selected-role-cta');
  const roleSelect = document.getElementById('supportType');
  roleLink?.addEventListener('click', () => {
    const selectedRole = document.querySelector('.role-choice.is-active');
    const intendedValue = selectedRole && roleMap[selectedRole.dataset.role];
    if (intendedValue && roleSelect) {
      roleSelect.value = intendedValue;
      roleSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
})();
