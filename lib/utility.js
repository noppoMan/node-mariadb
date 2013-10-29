exports.toSnakeCase = function(str){
    var capitalizeFirstLetter = function(str){
     return str.charAt(0).toLowerCase() + str.slice(1);
    };
    var s = capitalizeFirstLetter(str);
    var len = s.length;
    var converted = '';
    for(var i = 0; i < len; i++)
    {
        if(s[i].match(/[A-Z]/))
        {
            converted += '_' + s[i].toLowerCase();
        }
        else
        {
            converted += s[i];
        }
    }
    return converted;
}