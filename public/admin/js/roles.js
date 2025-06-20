const submitButton = document.querySelector('.button-submit');
if (submitButton) {
  submitButton.addEventListener('click', () => {
    const permissionTable = document.querySelector('.table-permission');
      if (permissionTable) {
        const roles = document.querySelectorAll('[role_id]');
        const numberRole = roles.length;
        const rolePermission = [];

        for (let i = 0; i < roles.length; i++) {
          rolePermission.push({
            id: roles[i].getAttribute('role_id'),
            permissions: []
          });
        }

        const permissions = document.querySelectorAll('[permission-name]');
        
        for (let i = 0; i < permissions.length; i++) {
          if (permissions[i].checked) {
            rolePermission[i % numberRole].permissions.push(
              permissions[i].getAttribute('permission-name'));
          }
        }
        
        fetch('/admin/roles/permissions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({rolePermission})
        })
        .then(res => res.json())
        .then(_ => {
          window.location.href = window.location.href;
        })
        .catch(err => {
          console.error('❌ Lỗi:', err.message);
        });
      }
  });
}

