convert all images in folder to base64 emotes

function dothing {
echo "["
for x in ./*.gif
do
  echo -n "[\""
  echo -n $x | cut -c 17- | tr -d '\n'
  echo -n "\",\"data:image/gif;base64,"
  base64 $x | tr -d '\n'
  echo "\"],"
done
echo "]"
}
