var myImage = document.querySelector('img');
myImage.onclick = function()
{
    var mySrc = myImage.getAttribute('src');
    if (mySrc === 'images/firefox-icon.png')
    {
        myImage.setAttribute('src','images/Deathly Hallows.jpg')
    }
    else
    {
        myImage.setAttribute('src','images/firefox-icon.png')
    }
}


var myButton = document.querySelector('button')
var siteText = document.getElementById("mytext")
myButton.onclick = function()
{
    var myInput = document.getElementById('fname').value
    siteText.innerHTML = "mozilla is cool, <br> " + myInput;
}