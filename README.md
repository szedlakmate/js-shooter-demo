# js-shooter-demo
"Egyszerű side scroller shot'em up játék űrhajóval"
Author: Máté Szedlák
16/09/2017

Please note, that since I am a brand new junior in this field, 
I tried to google up the available resources and hints on making
HTML5 games.

Using the knowledge I found online, I was able to write this code.
After all I feel the need to enlist the most important sources I
was using starting with the most important:

* Throughout step-by-step guide for writin vanilla JS HTML spacestuff game:
http://blog.sklambert.com/html5-canvas-game-panning-a-background/

* HTML5 canvas design tips:
https://www.slideshare.net/ernesto.jimenez/5-tips-for-your-html5-games

* Explosion with particles:
http://cssdeck.com/labs/particles-explosion-with-html5-canvas

*  _ A D D I T I O N A L  _  N O T E S _
- The code contains the possibility to easily implement the weapon of the enemies

- There is a bug in the enemyPool which leads to zombie enemies:
  The speed of the enemy will be 0 and it will become undestroyable, while
  it will catch bullets - **temporarily fixed**

- Gameflow modified: thegame is speeding up during playing

Checked compatibility:
- Chrome 61+
- Firefox 55+
- MS Edge 40+
- Opera 47+
