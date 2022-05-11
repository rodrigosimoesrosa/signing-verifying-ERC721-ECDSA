/**
 * Get Signed authorization message based on EIP 712
 * @param {*} authorizer 
 * @param {*} claimer 
 * @param {*} attributes 
 * @param {*} authorizedAt 
 * @param {*} chainId
 * @param {*} verifyingContract 
 * @returns 
 */
 function getSignedAuthorizationMessage (authorizer, claimer, attributes, authorizedAt, chainId, verifyingContract) {
    return {
        types: {
          EIP712Domain:[
            {name:"name",type:"string"},
            {name:"version",type:"string"},
            {name:"chainId",type:"uint256"},
            {name:"verifyingContract",type:"address"}
          ],
          MintNFT:[
            {name:"authorizer",type:"address"},
            {name:"claimer",type:"address"},
            {name:"attributes",type:"bytes6"},
            {name:"authorizedAt",type:"uint"},
            {name:"verifyingContract",type:"address"}
          ]
        },
        primaryType:"MintNFT",
        domain:{
          name:"Item",
          version:"V1",
          chainId: chainId,
          verifyingContract: verifyingContract
        },
        message:{
          authorizer: authorizer,
          claimer: claimer,
          attributes: attributes,
          authorizedAt: authorizedAt,
          verifyingContract: verifyingContract
        }
    };
}

module.exports = { getSignedAuthorizationMessage };
