var INVENTORY_WAREHOUSE_KEY='shopvn_warehouses';

var warehouses=[];

function loadWarehouses(){
  try{
    var raw=localStorage.getItem(INVENTORY_WAREHOUSE_KEY);
    if(!raw){
      warehouses=[
        {id:'#WH-001',name:'Thực hiện trung tâm',location:'123 Commerce St, NY',manager:'John Doe',phone:'+1 (555) 123-4567',stock:6490,transfer:3022,revenue:'25,737 USD'},
        {id:'#WH-002',name:'East Coast Hub',location:'456 Market Ave, NY',manager:'Jane Smith',phone:'+1 (555) 234-5678',stock:7362,transfer:4253,revenue:'$67,351'},
        {id:'#WH-003',name:'West Coast Depot',location:'789 Trade Blvd, CA',manager:'Richard Roe',phone:'+1 (555) 345-6789',stock:8842,transfer:3221,revenue:'$45,865'},
        {id:'#WH-004',name:'Southern Distribution',location:'101 Supply Rd, TX',manager:'Alice Johnson',phone:'+1 (555) 456-7890',stock:5463,transfer:2100,revenue:'$54,655'},
        {id:'#WH-005',name:'Northern Fulfillment',location:'202 Logistics Ln, IL',manager:'Michael Brown',phone:'+1 (555) 567-8901',stock:12643,transfer:7008,revenue:'$92,533'},
        {id:'#WH-006',name:'Midwest Center',location:'303 Central St, MO',manager:'Emily Davis',phone:'+1 (555) 678-9012',stock:7553,transfer:5600,revenue:'$43,898'},
        {id:'#WH-007',name:'Southeast Storage',location:'404 Storage Dr, FL',manager:'William Green',phone:'+1 (555) 789-0123',stock:9381,transfer:5343,revenue:'$76,909'},
        {id:'#WH-008',name:'Northwest Hub',location:'505 Commerce Pl, WA',manager:'Jessica White',phone:'+1 (555) 890-1234',stock:6500,transfer:3453,revenue:'$32,765'},
        {id:'#WH-009',name:'Southwest Fulfillment',location:'606 Trade Ave, AZ',manager:'Christopher Black',phone:'+1 (555) 901-2345',stock:7555,transfer:9000,revenue:'$67,565'},
        {id:'#WH-010',name:'Northeast Depot',location:'707 Distribution Rd, MA',manager:'Patricia Clark',phone:'+1 (555) 012-3456',stock:5499,transfer:3433,revenue:'$43,765'}
      ];
      saveWarehouses();
      return;
    }
    var parsed=JSON.parse(raw);
    warehouses=Array.isArray(parsed)?parsed:[];
  }catch(e){
    console.error('Không thể đọc danh sách kho',e);
    warehouses=[];
  }
}

function saveWarehouses(){
  try{
    localStorage.setItem(INVENTORY_WAREHOUSE_KEY,JSON.stringify(warehouses));
  }catch(e){
    console.error('Không thể lưu danh sách kho',e);
  }
}

function renderWarehouseTable(){
  const tbody=document.getElementById('tableBody');
  if(!tbody)return;
  tbody.innerHTML=warehouses.map((w,index)=>`<tr><td class="chk"><input type="checkbox"/></td><td><div class="tag">${w.id}</div></td><td><div class="name">${w.name}</div></td><td>${w.location}</td><td>${w.manager}</td><td>${w.phone}</td><td>${w.stock}</td><td>${w.transfer}</td><td style="font-weight:700;color:var(--accent)">${w.revenue}</td><td><div class="act"><div class="pill view" title="Xem" onclick="viewWarehouse(${index})"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="3" stroke="currentColor"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="currentColor"/></svg></div><div class="pill edit" title="Sửa" onclick="editWarehouse(${index})"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor"/></svg></div><div class="pill del" title="Xóa" onclick="deleteWarehouse(${index})"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor"/></svg></div></div></td></tr>`).join('');
}

function viewWarehouse(index){
  localStorage.setItem('inventoryWarehouseSelectedIndex',String(index));
  localStorage.setItem('inventoryWarehouseSelectedMode','view');
  window.location.href='inventory-warehouse-details.html';
}

function editWarehouse(index){
  localStorage.setItem('inventoryWarehouseSelectedIndex',String(index));
  localStorage.setItem('inventoryWarehouseSelectedMode','edit');
  window.location.href='inventory-warehouse-details.html';
}

function deleteWarehouse(index){
  if(!confirm('Bạn có chắc muốn xóa kho này?'))return;
  if(index<0||index>=warehouses.length)return;
  warehouses.splice(index,1);
  saveWarehouses();
  renderWarehouseTable();
}

function toggleSidebar(){document.querySelector('.layout').classList.toggle('collapsed');localStorage.setItem('sidebarCollapsed',document.querySelector('.layout').classList.contains('collapsed'));}

if(localStorage.getItem('sidebarCollapsed')==='true'){document.querySelector('.layout').classList.add('collapsed');}

function toggleSubmenu(element){const navItem=element.parentElement;navItem.classList.toggle('open');}

document.addEventListener('DOMContentLoaded',function(){
  loadWarehouses();
  renderWarehouseTable();
});
