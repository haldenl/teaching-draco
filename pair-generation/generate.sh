git add .
git commit -m 'Update.'
git push
ssh haldenl@playfair.cs.washington.edu
cd teaching-draco
git pull
:q
yarn clean
yarn generate
cd pair-generation
tar -czvf out.tar.gz out
logout
cp haldenl@playfair.cs.washington.edu:~/teaching-draco/pair-generation/out.tar.gz .
tar -xvzf out.tar.gz
