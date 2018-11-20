# MMM-Modal Development Documentation

This document describes the way to support your own MagicMirror² module with modal windows.

## Open a modal

To open a module you need to send a notification.

### Notification

The notification needs to have the name `OPEN_MODAL` and a payload object, that has the structure of the following object:

```javascript
{
    template: '',
    data: {}
}
```

#### Template Path

The `template` is the path to the nunjuck template of your modal as a string.

If the directory tree looks like this:
```
MagicMirror
|-modules
  |-YourModule
    |-ModalTemplate.njk
    |-templates
      |-AnotherTemplate.njk
```
Than the template path would look the following:
```javascript
{
    template: 'ModalTemplate.njk',
    ...
}
```
Or for a nested template like this:
```javascript
{
    template: 'templates/AnotherTemplate.njk',
    ...
}
```

#### Data

To be able to use some dynamic values in your template you can pass some `data` in the notification. Data should be an object.
Let's assume we have something like:

```javascript
{
    ...
    data: {
        myNumber: 11,
        oddArray: [1, 3, 5, 7, 9],
        anObject: {
            myNestedNumber: 19
        }
    }
}
``` 

## Template

There is an outer and inner template. The outer template is provided by `MMM-Modal` and renders the inner template (`your template`).

### Outer template

The outer template is rendering the inner template and looks as follow:
```
<div class="modal">
    {% include template %}
</div>
```

### Inner template

The inner template is your nunjuck template. Here you can access your `data` with handlebars syntax {{data.myNumber}}

## Example

An example notification to open a modal would be sent like that.
```javascript
this.sendNotification("OPEN_MODAL", {
    template: "MyModal.njk",
    data: {
        name: 'John Doe'
    }
});
```

MyModal.njk would look like:
```
<h1 class="bright">Hello {{data.name}}</h1>
```
 And this is the expected result.
