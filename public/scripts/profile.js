
(function ($) {


  function checkString(string) {
    if (!string) throw "must provide text input"
    if (typeof string !== 'string') throw 'invalid string input';
    if (string.trim().length === 0)
      throw 'string cannot be an empty string or just spaces';
    return string;
  }

  function checkWebsite(website) {
    if (!website) throw "must provide store link"
    if (typeof website !== 'string') throw 'invalid website input';
    if (website.trim().length === 0)
      throw 'Id cannot be an empty website or just spaces';
    if (!website.includes('https://www.') && !(website.includes('http://www.'))) throw 'invalid website'
    //end

    if (website.slice(website.length - 4, website.length) !== '.com') throw 'invalid website'
    //middle\\
    //console.log(website.slice(website.length - 4, website.length))
    site = website.indexOf('http://www.') + 11
    if (website.slice(site, -4).length < 2) throw 'invalid website input'


    return website;
  }


  //two forms 

  var bioForm = $("#bio"),
    bioInput = $("#bio_term"),
    error = $("#error"),
    storeForm = $("#stores"),
    storeName = $("#store_name"),
    storeLink = $("#store_link");
  error.hide();
  error.empty();


  bioForm.submit(function (event) {
    event.preventDefault();
    error.hide();

    error.empty();

    var bio = bioInput.val();
    try {
      bio = checkString(bio);
    } catch (e) {
      //alert(e);
      bioInput.empty();
      error.text(e);
      error.show();
      return;
    }

    event.currentTarget.submit();
  });


  storeForm.submit(function (event) {
    event.preventDefault();
    error.hide();
    error.empty();

    var storen = storeName.val();
    var storel = storeLink.val();
    try {

      storen = checkString(storen);
      storel = checkWebsite(storel);
    } catch (e) {
      //alert(e);
      storeName.empty();
      storeLink.empty();
      error.text(e);
      error.show();
      return;
    }

    event.currentTarget.submit();
  });


})(window.jQuery);