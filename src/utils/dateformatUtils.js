/*日期格式化模块*/
export function formatDate(time) {
    if(!time) return '';
    const date = new Date(time);
   return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + ' ' +
       date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}