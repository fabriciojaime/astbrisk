module.exports = {
    formatDate(date){
        let d = new Date(date);
        return  ("0"+ d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2) +"/"+d.getFullYear()+" "+("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2)+":"+("0"+d.getSeconds()).slice(-2);
    },

    sanitizeString(str){
        return str.normalize('NFD').replace(/([\u0300-\u036f]|[^\ \-0-9a-zA-Z])/g, '');
    }
}