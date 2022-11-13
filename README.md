# This is a simple figma plugin to be used with tolgee.

You will be prompted to enter your credentials and after that, all your TextNodes will be searched for the `t:`-prefix.
For all those nodes, the text-content will be updated from the cached tolgee keys.

When you edit a TextNode with a `t:`-prefixed name, the content will be used as the new value for the tolgee-key.
When you change the name of a previously non-prefixed TextNode to a prefixed TextNode, or if you create a new Node with
a prefix, a new key will be added to your tolgee project.

## TODO

[ ] Prompt user when changing a prefixed name to either non-prefixed ("should key be deleted?") or to another key ("rename key?")

[ ] Make sure that the plugin runs in background

[ ] Validate Input and give option to change config afterwards